# ⏭️ Continuar Sesión - Plan de Acción

## Estado Actual
La rama `feature/pedidos-estables` contiene ahora tanto la seguridad crítica de pedidos (V3.1) como el nuevo Módulo de Marketing. Todo está validado por `npm run validate:all`.

## Tareas Pendientes / Próximos Pasos

1.  **Merge a Main:**
    - Realizar el merge final una vez que el usuario confirme la estabilidad en el entorno local.
    - Borrar ramas de feature obsoletas.

2.  **Despliegue:**
    - `git push origin main`
    - `npm run deploy` (GitHub Pages).

3.  **Futuras Mejoras (Sugeridas):**
    - Implementar un sistema de "Cupones de Descuento" (opcional).
    - Mejorar el Dashboard de Estadísticas para que contemple las ventas generadas por promociones.

---
**Nota:** El sistema ya es consistente con las marcas y preposiciones ("en" efectivo, "con" transferencia). Todo el flujo de marketing masivo está blindado contra errores de usuario.
