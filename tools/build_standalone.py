"""Genera una aplicación HTML portátil con el PDF y sus 17 páginas incluidos."""
from pathlib import Path
import base64,json,re
root=Path(__file__).resolve().parent.parent
def data(path,mime):return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
assets={'pdf':data(root/'public/informatica.pdf','application/pdf'),'pages':{str(i):data(root/f'public/pages/{i}.jpg','image/jpeg') for i in range(1,18)}}
js='\n'.join(re.sub(r'^export ', '',(root/p).read_text(),flags=re.M) for p in ['core.js','content.js'])
app=re.sub(r'^import .*?;\n','',(root/'app.js').read_text(),flags=re.M)
html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="styles.css">','<style>'+(root/'styles.css').read_text()+'</style>')
html=html.replace('<link rel="icon" href="icon.svg" type="image/svg+xml">','')
html=html.replace('<script type="module" src="app.js"></script>','<script>window.IMPULSO_ASSETS='+json.dumps(assets)+';</script><script>'+js+'\n'+app+'</script>')
out=root/'estudiar.html';out.write_text(html)
print(f'{out.name}: {out.stat().st_size:,} bytes; aplicación, PDF y 17 páginas incluidos.')
