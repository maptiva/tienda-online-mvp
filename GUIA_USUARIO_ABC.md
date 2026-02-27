# 📖 Mi Guía ABC (Para Ale)

Ale, acá tenés el resumen de cómo cuidamos tu proyecto para que la IA (o cualquier persona) no rompa nada. Es el "seguro de salud" de tu código.

---

### 🅰️ El Sistema de "Aislación" (Ramas)
Imaginate que tu código es un edificio. `main` es el edificio terminado donde viven tus clientes.
- **Regla:** Ningún agente puede entrar a arreglar un caño con los inquilinos adentro.
- **Acción:** Cada vez que pidas algo, yo (o cualquier IA) creamos una "sucursal" (rama) del código, trabajamos ahí, y solo cuando está perfecto, lo mudamos al edificio principal (`main`).

### 🅱️ El "Control de Calidad" (Validación)
Tenemos un comando que revisa todo automáticamente. Se llama `validate:all`. 
- **Qué hace:** Revisa que el código compile, que la base de datos esté ordenada y que ninguna tienda pueda ver los datos de otra.
- **Tu tranquilidad:** Si una IA te dice "ya terminé", preguntale: *"¿Corriste el `validate:all`? ¿Qué te dio?"*. Si no dio "verde", no está terminado.

### 🅾️ El "Policía Automático" (CI/CD)
Esto es lo que sugirió tu amigo. Es un programa que vive en GitHub y que:
1. Recibe el código nuevo.
2. Lo pone a prueba en un servidor privado.
3. **Bloquea la puerta:** Si el código tiene un error, GitHub no deja que se meta en tu proyecto de producción.
4. Te avisa con una cruz roja ❌ o un tilde verde ✅.

---

### 🛠️ Cómo pedir tareas de ahora en más
Cada vez que llames a un Agente (yo u otro), decile esto:
*"Hola, leé el archivo `AGENT_HANDOVER.md` y seguí las reglas. Trabajá en una rama nueva y no cierres la tarea hasta que `npm run validate:all` pase al 100%."*

---

### 📋 Estado Actual del Proyecto
- **Seguridad:** 8.5/10 (Muy buena, falta automatizar la vigilancia).
- **Orden:** Tenemos archivos TSX (nuevos/seguros) y JSX (viejos que estamos limpiando).
- **Próxima Mejora:** Activar el "Policía Automático" (GitHub Actions) para que vos no tengas que estar vigilando errores básicos.

> [!TIP]
> Si alguna IA te borra algo que funcionaba, es porque no leyó el `AGENT_HANDOVER.md`. Pedile que revise el historial de Git y restaure lo perdido antes de seguir.
