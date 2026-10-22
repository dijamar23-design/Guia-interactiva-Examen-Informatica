"""Pruebas funcionales: servidor en http://127.0.0.1:3000 y Playwright + Chromium."""
import json, os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('APP_URL','http://127.0.0.1:3000')
KEY='impulso-informatica-v1'

def run():
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':1000})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  def state(): return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)
  def click(action): page.locator('[data-action="'+action+'"]').first.click()
  def nav(route): page.locator('[data-route="'+route+'"]:visible').first.click()
  def answer(q, value=None):
   v=q['answer'] if value is None else value
   if q['type']=='num':page.locator('#answer').fill(str(v))
   else:
    index=q['options'].index(v)
    page.locator('[data-action="select-answer"][data-index="'+str(index)+'"]').click()
   page.locator('#answer-form button[type="submit"]').click()
  page.goto(BASE)
  assert 'Dos horas' in page.locator('h1').inner_text()
  assert not state()['running'] and state()['elapsed']==0
  click('begin')
  assert len(state()['quiz']['questions'])==10
  q=state()['quiz']['questions'][0]
  answer(q,q['options'][1])
  assert page.locator('.feedback.incorrect').count()==1
  assert page.locator('[data-action="next-question"]').count()==0
  click('remedy')
  z=state()['quiz'];assert z['remedial']['topic']==q['topic']
  answer(z['remedial'])
  click('next-question')
  for _ in range(9):
   z=state()['quiz'];answer(z['questions'][z['index']]);click('next-question')
  assert state()['diagnostic']['correct']==9
  print('PASS: diagnóstico 10 preguntas, error, bloqueo y refuerzo')
  page.locator('#global-toggle').click()
  elapsed=state()['elapsed']
  page.wait_for_timeout(1200)
  assert state()['elapsed']==elapsed
  page.reload()
  assert state()['diagnostic']['correct']==9 and not state()['running']
  print('PASS: pausa y progreso conservado al recargar')
  nav('fundamentos')
  page.locator('[data-action="bit"]').first.click()
  assert '5 decimal' in page.locator('#binary-output').inner_text()
  page.locator('[data-action="lesson"][data-topic="ascii"]').click()
  page.locator('#ascii-input').fill('405')
  page.locator('#ascii-form button[type="submit"]').click()
  assert '52 48 53' in page.locator('#ascii-output').inner_text()
  assert '34 30 35' in page.locator('#ascii-output').inner_text()
  print('PASS: laboratorio binario y codificación ASCII')
  nav('procedimientos')
  page.locator('[name="value"]').fill('33')
  page.locator('[name="from"]').select_option('10')
  page.locator('[name="to"]').select_option('8')
  page.locator('#solver-form button[type="submit"]').click()
  while page.locator('[data-action="next-step"]').count():click('next-step')
  assert '41' in page.locator('.solver-answer').inner_text()
  page.locator('[name="value"]').fill('128')
  page.locator('[name="from"]').select_option('8')
  page.locator('#solver-form button[type="submit"]').click()
  assert 'dígitos válidos' in page.locator('.error-text').inner_text()
  page.locator('#sum-form button[type="submit"]').click()
  assert '1001100' in page.locator('#sum-result').inner_text()
  print('PASS: conversión guiada, validación de base y suma con acarreo')
  click('start-practice')
  z=state()['quiz'];answer(z['questions'][0]);click('next-question')
  assert state()['quiz']['index']==1
  nav('tarjetas')
  old=state()['cardId'];click('flip-card');click('rate-card')
  assert state()['cardSchedule'][old]['rating']=='again'
  assert state()['cardId']!=old
  assert state()['cardSchedule'][old]['due']>0
  print('PASS: práctica adaptativa y repetición espaciada')
  nav('simulacro');click('start-exam')
  assert len(state()['exam']['questions'])==25
  assert page.locator('.feedback').count()==0
  for i in range(25):
   e=state()['exam'];q=e['questions'][i]
   # One intentionally wrong answer: all others are correct.
   if q['type']=='num':
    page.locator('#answer').fill('9' if i==0 else str(q['answer']))
    page.locator('#exam-answer-form button[type="submit"]').click()
   else:
    option=q['options'].index(q['answer'])
    if i==0:option=(option+1)%len(q['options'])
    page.locator('[data-action="select-answer"][data-index="'+str(option)+'"]').click()
   assert page.locator('.feedback, .exam-correction').count()==0
   if i<24:click('exam-next')
  page.reload()
  assert len(state()['exam']['answers'])==25
  click('finish-exam')
  assert state()['exam']['submitted']
  assert '9.6' in page.locator('.score-circle').inner_text()
  assert page.locator('.wrong-item').count()==1
  page.locator('.wrong-item summary').click()
  click('exam-remedy')
  assert state()['quiz']['mode']=='errors'
  print('PASS: 25 respuestas, soluciones ocultas, calificación 9.6 y refuerzo posterior')
  nav('repaso')
  assert page.locator('.cheatsheet-grid>div').count()==6
  assert page.locator('.mastery-item').count()==6
  with page.expect_download() as dl:click('export')
  assert dl.value.suggested_filename.endswith('.json')
  page.emulate_media(media='print')
  assert page.locator('.print-sheet').is_visible()
  assert not page.locator('.sidebar').is_visible()
  page.emulate_media(media='screen')
  print('PASS: resultados, hoja imprimible y descarga de progreso')
  # Check all pages are available and mobile routes do not overflow.
  nav('inicio')
  page.screenshot(path='/tmp/impulso-desktop-final.png',full_page=True)
  for width in [360,390,768]:
   page.set_viewport_size({'width':width,'height':844})
   for route in ['inicio','diagnostico','fundamentos','procedimientos','tarjetas','simulacro','repaso','fuentes']:
    nav(route)
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),f'Overflow {width} {route}'
  page.locator('[data-action="page"][data-page="17"]').first.click()
  assert page.locator('.source-image').evaluate('(img)=>img.complete && img.naturalWidth>0')
  for i in range(1,18): assert page.request.get(BASE+'/public/pages/'+str(i)+'.jpg').status==200
  assert page.request.get(BASE+'/public/informatica.pdf').status==200
  print('PASS: ocho vistas a 360/390/768 px; 17 imágenes y PDF accesibles')
  # Automatic expiration, preserved selected answers.
  page.add_init_script("""let s=JSON.parse(localStorage.getItem('impulso-informatica-v1'));if(s?.exam){s.exam.submitted=false;s.exam.remaining=0.1;s.running=true;s.elapsed=100;s.lastTick=Date.now()-1000;s.route='simulacro';localStorage.setItem('impulso-informatica-v1',JSON.stringify(s));}""")
  page.reload()
  page.wait_for_timeout(1100)
  assert state()['exam']['submitted'] and state()['exam']['remaining']==0
  print('PASS: entrega automática al agotarse el cronómetro')
  # New session timer accuracy and reset confirmation.
  nav('repaso');click('reset');click('cancel-reset')
  assert state()['attempts']
  click('reset');click('confirm-reset')
  assert len(state()['attempts'])==0 and state()['elapsed']==0
  page.set_viewport_size({'width':390,'height':844})
  page.screenshot(path='/tmp/impulso-mobile-final.png',full_page=True)
  assert not errors,errors
  print('PASS: reinicio confirmado y cero errores de JavaScript')
  browser.close()
if __name__=='__main__':run()
