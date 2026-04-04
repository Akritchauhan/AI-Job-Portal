import os
import glob
import re

directory = r"d:\placement\AI-Job-Portal\frontend\src\pages"
files = glob.glob(directory + "\\*.js")

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # replace "http://127.0.0.1:8000/api/..." -> `${process.env.REACT_APP_API_URL}/...`
    # handles double quotes
    content = re.sub(r'"http://127\.0\.0\.1:8000/api([^"]*)"', r'`${process.env.REACT_APP_API_URL}\1`', content)
    # handles single quotes if any
    content = re.sub(r"'http://127\.0\.0\.1:8000/api([^']*)'", r'`${process.env.REACT_APP_API_URL}\1`', content)
    # handles backticks
    content = re.sub(r'`http://127\.0\.0\.1:8000/api([^`]*)`', r'`${process.env.REACT_APP_API_URL}\1`', content)
    
    # handles anything else that targets the backend directly
    content = re.sub(r'"http://127\.0\.0\.1:8000([^"]*)"', r'`${process.env.REACT_APP_BACKEND_URL}\1`', content)
    content = re.sub(r"'http://127\.0\.0\.1:8000([^']*)'", r'`${process.env.REACT_APP_BACKEND_URL}\1`', content)
    content = re.sub(r'`http://127\.0\.0\.1:8000([^`]*)`', r'`${process.env.REACT_APP_BACKEND_URL}\1`', content)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Replacement complete.")
