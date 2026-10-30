#!/usr/bin/env python3
from pathlib import Path
import re
for p in Path('src').rglob('*.ts'):
    text = p.read_text(errors='ignore')
    for m in re.finditer(r'update\s*\([^)]*\)\s*{([\s\S]*?)}', text):
        body = m.group(1)
        if any(tok in body for tok in ['new ', '.map(', '.filter(', 'add.text', 'add.sprite']):
            print(f'Potential hot-path allocations in {p}')
