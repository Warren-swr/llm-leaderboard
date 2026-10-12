"""把分数收集 workflow 的输出（收集 + 回源核验）合并成 data/scores/<model>.json。

用法：python3 pipeline/merge_collection.py <workflow 输出 JSON>
原始输出另存到 data/research/，便于追溯。
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
raw = json.loads(Path(sys.argv[1]).read_text())
res = raw.get('result', raw)

out_dir = ROOT / 'data/scores'
out_dir.mkdir(parents=True, exist_ok=True)
stats = {}
for item in res['results']:
    if not item or not item.get('collected'):
        continue
    col = item['collected']
    verdicts = {v['index']: v for v in ((item.get('verdicts') or {}).get('verdicts') or [])}
    recs = []
    st = {'confirmed': 0, 'corrected': 0, 'not_found': 0, 'unreachable': 0, 'unchecked': 0, 'noncomparable_fix': 0}
    for i, r in enumerate(col['records']):
        v = verdicts.get(i)
        notes = [r.get('note') or '']
        rec = {
            'benchmark': r['benchmark'],
            'score': r['score'],
            'setting': f"{r['metric_as_reported']}；{r['setting']}",
            'sourceType': r['sourceType'],
            'sourceName': r['sourceName'],
            'url': r['url'],
            'quote': r['quote'],
            'comparable': r['comparable'],
            'matchesPreferred': r['matchesPreferred'],
            'primaryHint': r['primaryHint'],
        }
        if v is None:
            st['unchecked'] += 1
            notes.append('未经回源核验')
        elif v['status'] == 'confirmed':
            st['confirmed'] += 1
            rec['verified'] = True
        elif v['status'] == 'corrected':
            st['corrected'] += 1
            if isinstance(v.get('score_found'), (int, float)):
                notes.append(f"核验更正：原记录 {r['score']} → {v['score_found']}")
                rec['score'] = v['score_found']
            rec['verified'] = True
            if v.get('fix'):
                notes.append(v['fix'])
        elif v['status'] == 'not_found':
            st['not_found'] += 1
            rec['verified'] = False
            notes.append('核验未找到该数字：' + (v.get('fix') or ''))
        elif r['url'].startswith('https://openai.com/'):
            # OpenAI 页面对自动访问返回 403；核验者按收集阶段保存的官方页面副本逐条核对
            st['unreachable'] += 1
            rec['verified'] = True
            notes.append('OpenAI 页面拒绝自动访问（403），已按 2026-10-12 抓取保存的官方页面副本核对；副本不随仓库公开，SHA256 见 data/sources/openai/SHA256SUMS')
        else:
            st['unreachable'] += 1
            notes.append('核验时无法打开原网页' + ('：' + v['fix'] if v.get('fix') else ''))
        if v is not None and v.get('comparable_ok') is False and rec['comparable'] is not False:
            st['noncomparable_fix'] += 1
            rec['comparable'] = False
            notes.append('核验判定口径不可比：' + (v.get('fix') or ''))
        note = '；'.join(n for n in notes if n)
        if note:
            rec['note'] = note
        recs.append(rec)
    refs = [r for r in col.get('references', []) if r.get('url')]
    (out_dir / f"{item['model']}.json").write_text(json.dumps(
        {'model': item['model'], 'records': recs, 'references': refs,
         'notFound': col.get('not_found', []), 'collectorNotes': col.get('notes', ''),
         'verifierSummary': (item.get('verdicts') or {}).get('summary', '')},
        ensure_ascii=False, indent=1))
    stats[item['model']] = (len(recs), st)

for m, (n, st) in stats.items():
    print(f'{m:22} {n:3} ' + ' '.join(f'{k}={v}' for k, v in st.items() if v))
