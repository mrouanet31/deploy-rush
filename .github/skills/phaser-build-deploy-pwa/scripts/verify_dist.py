#!/usr/bin/env python3
from pathlib import Path
import sys
dist = Path('dist')
if not dist.exists(): sys.exit('missing dist; run build first')
if not (dist/'index.html').exists(): sys.exit('missing dist/index.html')
assets = list(dist.rglob('*'))
print(f'dist entries: {len(assets)}')
print('OK')
