import re

content = open('frontend/src/app/App.tsx', 'r', encoding='utf-8').read()
lines = content.split('\n')

for i, line in enumerate(lines):
    # Skip comments
    clean_line = re.sub(r'\{/\*.*?\*/\}', '', line)
    for m in re.finditer(r'<div|</div', clean_line):
        # Check for self-closing on same line
        if m.group(0) == '<div' and re.search(r'[^>]*/>', clean_line[m.end():]):
            print(f"{i+1}: <div /> (Self-closing)")
        else:
            print(f"{i+1}: {m.group(0)}")
