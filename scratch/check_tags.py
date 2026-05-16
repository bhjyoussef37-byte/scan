import re

with open(r'c:\Users\bhjyo\Desktop\projectfinal\frontend\src\app\App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

div_opens = len(re.findall(r'<div', content))
div_closes = len(re.findall(r'</div', content))

motion_opens = len(re.findall(r'<motion\.div', content))
motion_closes = len(re.findall(r'</motion\.div', content))

print(f"Divs: {div_opens} open, {div_closes} close")
print(f"Motion Divs: {motion_opens} open, {motion_closes} close")
