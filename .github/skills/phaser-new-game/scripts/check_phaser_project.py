#!/usr/bin/env python3
from pathlib import Path
import json, sys
root = Path.cwd()
problems = []
if not (root/'package.json').exists(): problems.append('missing package.json')
else:
    data = json.loads((root/'package.json').read_text())
    deps = {**data.get('dependencies', {}), **data.get('devDependencies', {})}
    if 'phaser' not in deps: problems.append('package.json does not declare phaser')
if not (root/'src').exists(): problems.append('missing src directory')
if problems:
    print('Problems:')
    print('\n'.join('- '+p for p in problems))
    sys.exit(1)
print('Phaser project skeleton looks present.')
