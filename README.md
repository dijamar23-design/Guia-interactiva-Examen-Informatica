# Impulso · Informática en 120 minutos

Plataforma de estudio basada en las 17 páginas del PDF aportado (páginas impresas 40–56). HTML, CSS y JavaScript sin dependencias de ejecución, servidores de datos, cuentas ni claves.

## Usar

Desde este directorio:

```sh
python3 -m http.server 3000 --bind 0.0.0.0
```

Abre `http://localhost:3000`. Para llevarla a Windows o Android sin servidor:

```sh
python3 tools/build_standalone.py
```

Abre el archivo generado `estudiar.html` en Chrome o Edge. Incluye código, estilos, el PDF y sus 17 imágenes. No necesita conexión. El navegador debe permitir JavaScript y almacenamiento local para conservar el progreso. Cada dispositivo/navegador guarda una sesión independiente.

## Flujo pedagógico

- Diagnóstico de 10 preguntas (0–10 min), con resultado inicial separado de los refuerzos.
- Fundamentos (10–35): seis temas, laboratorio binario y codificador ASCII.
- Procedimientos (35–70): conversiones y sumas paso a paso; práctica intercalada adaptativa.
- Memoria activa (70–90): 16 tarjetas con repetición a 30 s, 3 min o 7 min.
- Simulacro (90–110): 25 preguntas, 20 minutos, sin soluciones hasta la entrega.
- Repaso (110–120): resultados, dominio por tema, errores, ejercicios de recuperación y hoja imprimible.

El cronómetro empieza al iniciar una actividad o pulsar reanudar. Pausar la sesión pausa también el simulacro. Si dejas el reloj en marcha al cerrar o recargar, el tiempo transcurrido cuenta. Al agotarse el tiempo del simulacro se entregan las respuestas guardadas. Navegar no marca un bloque como comprendido; el estudiante debe resolver los refuerzos antes de continuar la secuencia de preguntas.

El dominio muestra el porcentaje de aciertos en los últimos 12 intentos de cada tema; no es una predicción de calificación. La prioridad del temario es una estimación por resaltados y ejercicios del material. Las erratas y respuestas manuscritas incorrectas se identifican en «Material y fuentes».

## Comprobar

```sh
npm test
python3 tests/browser_test.py
```

Las pruebas de navegador requieren Playwright para Python y Chromium. En esta máquina ya están disponibles. Se puede configurar `CHROMIUM_PATH` y `APP_URL`. El servidor debe estar en marcha. Las pruebas usan un navegador aislado y no modifican el progreso del estudiante.

## Publicar para la clase

El sitio está listo para GitHub Pages y utiliza rutas relativas, válidas bajo `/Guia-interactiva-Examen-Informatica/`.

1. En el repositorio, abre **Settings → Pages → Build and deployment → Source: GitHub Actions**. Esta activación requiere permisos de administración.
2. El flujo `.github/workflows/pages.yml` valida y publica cuando cambia `main`, o con **Actions → Validar y publicar Impulso → Run workflow**.
3. El trabajo `deploy` muestra la URL real tras finalizar. No se debe considerar publicado hasta que el despliegue termine y la dirección responda correctamente.

No se recopilan nombres, respuestas ni estadísticas en un servidor. La aplicación no contiene analíticas ni recursos externos. El PDF y las páginas del material forman parte del sitio público.
