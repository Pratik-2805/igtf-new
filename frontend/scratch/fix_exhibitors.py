import re
import os

file_path = r'd:\Desktop\Projects\IGTF\frontend\components\admin\ExhibitorsTab.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the mangled line
new_content = re.sub(r'productCategory: exhibitor\.product_category \|\| \" \\,', 'productCategory: exhibitor.product_category || "",', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
