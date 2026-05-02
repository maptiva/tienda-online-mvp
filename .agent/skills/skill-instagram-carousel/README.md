# Skill: Instagram Carousel Generator para Claude Code

Generá carousels de Instagram listos para subir — diseño profesional, 1080x1350px, exportados como PNG. Todo desde tu terminal con Claude Code.

---

## Qué hace

Le decís a Claude Code "creame un carousel sobre X" y él:

1. **Te pregunta** tu marca, color, handle, tipografía, tono
2. **Genera un HTML** self-contained con preview tipo Instagram (swipeable)
3. **Lo abrís en el browser**, swipeás, pedís cambios
4. **Exporta PNGs** de cada slide a 1080x1350px — listos para subir a IG

Sin Canva. Sin Figma. Sin templates genéricos. Claude diseña, vos aprobás.

---

## Cómo se instala (30 segundos)

```bash
# 1. Copiá la carpeta entera a tu directorio de skills de Claude Code
cp -r skill-instagram-carousel ~/.claude/skills/instagram-carousel

# 2. Instalá las dependencias para exportar PNGs (una sola vez)
pip install playwright
playwright install chromium
```

Listo. La próxima vez que abras Claude Code, la skill ya está disponible.

---

## Cómo se usa

Abrí Claude Code en la carpeta de tu proyecto y pedile:

```
Creame un carousel de Instagram sobre [tu tema]
```

Claude te va a preguntar los detalles de tu marca. Respondé y dejalo trabajar.

### Ejemplo de lo que podés pedir

- "Haceme un carousel sobre por qué la IA reemplaza a los setters humanos"
- "Creame slides de IG sobre el método Karpathy de segundo cerebro"
- "Diseñame un carousel para promocionar mi curso de $497"

### Personalización avanzada

Podés meter tu propia tipografía de cabecera (`.otf` o `.ttf`) en la carpeta `assets/` y Claude la embebe automáticamente en los slides via `@font-face`.

---

## Estructura de la skill

```
skill-instagram-carousel/
├── SKILL.md                          ← El cerebro: Claude lee esto para saber qué hacer
├── references/
│   └── design-system.md              ← Sistema de diseño completo (colores, tipografía, componentes)
├── scripts/
│   └── export_slides.py              ← Script de export: HTML → 7 PNGs de 1080x1350px
└── assets/                           ← Acá va tu logo y/o tipografía custom (opcional)
    └── (tu-logo.webp, tu-font.otf)
```

---

## Requisitos

- **Claude Code** (con acceso a terminal)
- **Python 3.8+**
- **Playwright** + Chromium (`pip install playwright && playwright install chromium`)
- Un browser para previsualizar el HTML

---

## Tips

- **Primera slide = scroll stopper.** Tiene que ser una frase que pare el pulgar. No una descripción.
- **Última slide = CTA claro.** "Comenta X" funciona mejor que "seguime" o "link en bio".
- **Alternar claro/oscuro** entre slides mantiene la atención.
- **Tags de slide** describen el contenido, no la estructura ("AGENTE DE IA 24/7", no "LA SOLUCIÓN").
- Si tenés una font premium (como Termina, Clash Display, etc.), tirala en `assets/` y Claude la usa.

---

## Querés que te lo instale yo?

Si preferís que alguien te lo configure, te personalice la paleta de colores, te arme la tipografía y te deje todo listo para generar carousels con un solo mensaje:

👉 **Escribime por Instagram a [@JordiGPT](https://instagram.com/jordigpt) con el mensaje "CAROUSEL"** y agendamos una call 1:1 de 30 minutos donde te lo dejo andando.

---

Hecho con Claude Code por [@JordiGPT](https://instagram.com/jordigpt)
