#!/usr/bin/env python3
from pathlib import Path
import json
print('Files:')
for p in ['package.json','vite.config.ts','tsconfig.json']:
    print(f'- {p}:', 'yes' if Path(p).exists() else 'no')
if Path('package.json').exists():
    data=json.loads(Path('package.json').read_text())
    deps={**data.get('dependencies',{}),**data.get('devDependencies',{})}
    print('phaser:', deps.get('phaser','not declared'))
print('scene files:', len(list(Path('src').rglob('*Scene.ts'))) if Path('src').exists() else 0)
