#!/usr/bin/env python3
from pathlib import Path
import re, json
root=Path.cwd()
print('Phaser audit')
if (root/'package.json').exists():
    data=json.loads((root/'package.json').read_text())
    deps={**data.get('dependencies',{}),**data.get('devDependencies',{})}
    print('phaser:', deps.get('phaser','not declared'))
patterns={
 'possible Phaser 2 State pattern': r'Phaser\.State|state\.add|state\.start',
 'allocation in update': r'update\s*\([^)]*\)\s*{[\s\S]{0,500}(new |add\.sprite|add\.text)',
 'raw asset key usage': r'add\.(image|sprite|audio|tilemap)\([^,]+,[^,]+,\s*["\']',
}
for label,pat in patterns.items():
    hits=[]
    for p in root.rglob('*.ts'):
        if 'node_modules' in p.parts: continue
        text=p.read_text(errors='ignore')
        if re.search(pat,text): hits.append(str(p))
    print(label+':', len(hits))
    for h in hits[:10]: print(' -',h)
