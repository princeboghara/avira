import urllib.request
import re

req = urllib.request.Request('https://aviralifecare.com/login', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

forms = re.findall(r'<form[\s\S]*?</form>', html, re.I)
for f in forms:
    print('Action:', re.findall(r'action=[\"\'](.*?)[\"\']', f))
    print('Method:', re.findall(r'method=[\"\'](.*?)[\"\']', f))
    inputs = re.findall(r'<input[\s\S]*?>', f, re.I)
    for inp in inputs:
        print('  Input:', inp)
