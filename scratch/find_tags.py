import re

content = open('frontend/src/app/App.tsx', 'r', encoding='utf-8').read()
lines = content.split('\n')

stack = []
for i, line in enumerate(lines):
    # Find all tags in this line
    matches = re.finditer(r'<(div|motion\.div|AnimatePresence)|</(div|motion\.div|AnimatePresence)>', line)
    for m in matches:
        tag = m.group(1) or m.group(2)
        is_closing = m.group(0).startswith('</')
        
        # Check if it's self-closing (on the same line)
        if not is_closing and re.search(r'[^>]*/>', line[m.end():]):
            # print(f"Self-closing {tag} at line {i+1}")
            continue
            
        if is_closing:
            if stack:
                last_tag, last_line = stack.pop()
                if last_tag != tag:
                    print(f"Mismatch: {last_tag} (L{last_line}) closed by {tag} (L{i+1})")
            else:
                print(f"Extra closing {tag} at line {i+1}")
        else:
            stack.append((tag, i+1))

for tag, line in stack:
    print(f"UNCLOSED: {tag} at line {line}")
