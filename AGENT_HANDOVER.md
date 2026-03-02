# 🤝 Handover Técnico - 01/03/2026

## 🚀 Estado Actual: "Rama feature/pedidos-estables"
La rama está en su punto más alto de estabilidad y seguridad. Se ha realizado una limpieza profunda de la raíz y se ha implementado seguridad de grado producción.

## 🛡️ Seguridad de Pedidos (V3.1) - ¡CRÍTICO!
- Se implementó la función RPC `create_public_order` con **Autoridad en Servidor**.
- **Logro:** El sistema recalcula totales en la DB, ignorando manipulaciones del cliente.
- **Fix de Último Minuto:** Se corrigió la discrepancia de nombres de parámetros (`p_client_total`) y se añadió redondeo a 2 decimales en el frontend para evitar bloqueos por micro-centavos.
- **Test de Estrés:** El archivo `tests/security-stress-test.js` confirma que el sistema bloquea ataques cross-store, manipulación de precios y descuentos inválidos.

## 👥 Impersonación (Fix SuperAdmin)
- **Problema corregido:** El Master Admin veía sus propios pedidos/descuentos al "simular" otra tienda.
- **Solución:** Se actualizaron `OrdersDashboard.jsx`, `DiscountSettingsPage.jsx` y `useStoreId.ts` para priorizar `impersonatedUser` sobre `user`.

## 📈 Estadísticas y Stock
- Módulo de estadísticas en TS (`src/modules/stats`) funcionando 100%.
- Trigger de stock automático en cancelaciones de pedidos activo y verificado.

## 🧹 Orden Profesional
- La raíz está limpia. Archivos internos movidos a:
  - `docs/internal/`: Planes y estrategias.
  - `docs/audit/`: Informes de seguridad.
  - `scripts/sql_tools/`: Utilidades SQL.
- `.gitignore` blindado para proteger documentos privados en el merge a `main`.

## 🛠️ Próximo Agente:
1. Leer `docs/audit/PROPUESTA_SEGURIDAD_V2_PEDIDOS.md` para entender la lógica V3.1.
2. La base de datos de Dev YA tiene el SQL V3.1 aplicado. No tocar a menos que haya cambios.
3. Siguiente tarea: **Módulo de Promociones y Llamadores** (Ver `PLAN_PROMOCIONES_Y_LLAMADORES.md`).
