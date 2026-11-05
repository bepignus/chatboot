---
family: playful
variant: [playful, playful-paper]
type: login / 404 / greetings / games
theme: both
products: [nocturne, bamboo, sleuth]
also_in_family: "login-forms (mochi, den, flow, lunara, portal, vault, huddle, verso, tether, lumen), 404 (caveman), love & celebrations (love-letter, birthday, posy, heartcode), playful pages (gungame, deadline, intro)"
captured: 2026-11-05
capture_dirs: [.captures/clean/b/demo-codeandchill-store-{nocturne,bamboo,sleuth}]
confidence: alta (demos capturadas)
---

# Playful · escenas con personaje

## En una frase
Una pantalla utilitaria (login, 404, felicitación) convertida en **una mini historia con un
personaje y una interacción física**. El panda se tapa los ojos al escribir la contraseña, hay
que tirar del cordón de la lámpara para ver el formulario y la lupa del pájaro sigue al ratón.
La interfaz va encima, en una card de cristal o sobre papel cálido.

## Señas de identidad
1. **Ilustración propia hecha con CSS/SVG**, nunca stock:
   - personaje con cara expresiva (ojos que se cierran, mejillas rosadas);
   - escena con capas (árboles, hojas que caen, luciérnagas).
2. **Una interacción que cuenta algo**: tirar, tapar o seguir. El estado de la UI cambia la
   escena: escribir la contraseña hace que el personaje mire o se tape.
3. **Animación ambiental permanente y lenta**:
   - `drift` de 19–24 s;
   - `aur1`/`aur2` (aurora) de 20–26 s;
   - `bob` de 4.8 s;
   - `grain 6s steps(6)`, que da textura de película.
4. **Card de login de cristal**: radio 26, `blur(24–26px) saturate(1.3)`, borde
   `rgb(255 255 255 / .13–.18)`, sombra `0 40px 80px rgb(0 0 0 / .5)` y highlight superior.
5. **Inputs grandes** (alto 52–55, radio 12–13) con **label flotante** (padding `20px 16px 8px`)
   y botón de mostrar contraseña.
6. **CTA en gradiente con glow de su color**, más dos botones sociales (Google · Apple) en 2
   columnas y el enlace "New to X? Create account".

## Productos medidos
| producto | fondo | card / UI | acento | fuentes | nota |
| --- | --- | --- | --- | --- | --- |
| nocturne | bosque ilustrado verde con niña en bici animada (`ride`) | cristal radio 26, padding `42px 40px` | gradiente `#b9a7ff → #7c5cff`, texto `#17102e`, glow `0 12px 26px rgb(124 92 255 / .42)` | Poppins 300–600 | Hojas que caen (`fall`), aurora, filtro `hue-rotate(104deg)` para recolorear la escena |
| bamboo | casi negro `#060a08`, oscuro hasta encender la lámpara | cristal radio 26 que se ilumina al tirar del cordón ("PULL THE CORD") | menta `#a5f3d0` → `#4fd6a0`, glow `0 16px 30px -10px rgb(28 143 106 / .55)` | Sora 700 (título) + Manrope | Panda que se tapa los ojos; `ropeSway`, `glowbreath`, `mote-drift` |
| sleuth | papel `#f7ead3` con viñeta interior y suelo de tablas | sin card: título centrado más botón píldora | ladrillo `#b8412a`, mostaza `#d59c3a` | Baloo 2 800 (título y "404" gigante) + Nunito Sans + IBM Plex Mono | El cursor es una lupa que revela una cuadrícula; pájaro con pasos; hover del botón `translateY(-2px)` |

## Tipografía
- **Título amable**: 31–54 px, 600–800, tracking −0.02em. Usa fuentes redondeadas o
  geométricas: Poppins, Sora o Baloo 2.
- **Subtítulo**: 14 px, peso 300–400, tono cercano ("Welcome back. Your panda's keeping watch.").
- **Etiquetas de instrucción**: MAYÚSCULAS de 12 px con tracking 0.08em en un color cálido
  ("PULL THE CORD").

## Motion
- **Entradas**: `opacity, transform .5s cubic-bezier(.2,.7,.2,1)`.
- **Hover del CTA**: el glow crece (`0 16px 32px … .55`) más `brightness(1.06)`.
- **Hover de los botones sociales**: fondo `.12` y `translateY(-1px)`.

## Voz
- **Cálida, en segunda persona**, con humor ligero: "Nothing at this address.", "Back to Home".
- **El personaje tiene nombre y actitud.**

## Qué NO hacer
- Personajes de stock, emojis como ilustración o animaciones rápidas e insistentes.
- Escenas que tapen o retrasen el formulario más de un gesto.
- Olvidar `prefers-reduced-motion`.
