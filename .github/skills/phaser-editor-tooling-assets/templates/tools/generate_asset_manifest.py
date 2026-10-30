#!/usr/bin/env python3
from pathlib import Path
import json
assets = []
for p in Path('public/assets').rglob('*'):
    if p.is_file(): assets.append({'path': str(p), 'key': p.stem})
Path('src/generated').mkdir(parents=True, exist_ok=True)
Path('src/generated/assets.json').write_text(json.dumps(assets, indent=2))
print(f'wrote {len(assets)} assets')
