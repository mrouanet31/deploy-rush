#!/usr/bin/env python3
from pathlib import Path
import re
for p in Path('src').rglob('*.ts'):
    for m in re.finditer(r"['\"]([a-zA-Z0-9_.:-]+)['\"]", p.read_text(errors='ignore')):
        s=m.group(1)
        if any(tok in s for tok in ['player','enemy','tile','music','sound','atlas','sprite']):
            print(f'{p}:{m.start()}: {s}')
