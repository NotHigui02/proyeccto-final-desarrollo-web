# Specs del proyecto 05 · Gastos con gráficos

Specs locales de trabajo. Cada uno cubre un bloque del enunciado (`Proyectos/05-gastos-con-graficos.md`)
y se implementa en orden. Al terminar un spec: `npm run check`, actualizar su estado aquí, registrar en
`ia/bitacora.md` y hacer commit.

| #   | Spec                                                                 | Cubre                                     | Hito | Estado    |
| --- | -------------------------------------------------------------------- | ----------------------------------------- | ---- | --------- |
| 00  | [Visión y arquitectura](00-vision-y-arquitectura.md)                 | Decisiones y adaptaciones al enunciado    | —    | Hecho     |
| 01  | [Configuración del proyecto e IA](01-configuracion-proyecto-e-ia.md) | §15, estructura, calidad automática       | 1    | Hecho     |
| 02  | [Dominio y esquemas compartidos](02-dominio-y-esquemas.md)           | §8, dinero en centavos, Intl, CA-1        | 1    | Hecho     |
| 03  | [Resumen y gráficos con datos de ejemplo](03-resumen-y-graficos.md)  | RF-02, RF-03, RF-05, §5, §6, CA-2, CA-3   | 1    | Hecho     |
| 04  | [Base de la API REST](04-api-base.md)                                | §9.2, §9.6 (cabeceras, CORS, límites)     | 3    | Hecho     |
| 05  | [Categorías](05-categorias.md)                                       | RF-01 (categorías), §8                    | 2–3  | Hecho     |
| 06  | [Movimientos](06-movimientos.md)                                     | RF-01 (movimientos), §8, lista con cursor | 2–3  | Hecho     |
| 07  | [Resumen desde la API](07-resumen-api.md)                            | `GET /api/resumen`, RF-02, RF-03          | 3    | Hecho     |
| 08  | [Presupuesto mensual](08-presupuesto.md)                             | RF-04, CA-4                               | 2–3  | Hecho     |
| 09  | [Exportar a CSV](09-exportar-csv.md)                                 | RF-06                                     | 3    | Hecho     |
| 10  | [Persistencia en Firestore](10-persistencia-firestore.md)            | §9.3, §9.4                                | 3    | Hecho     |
| 11  | [Autenticación y sesión](11-autenticacion.md)                        | §9.1, roles, CSRF                         | 4    | Hecho     |
| 12  | [Comprobantes con Vercel Blob](12-comprobantes-blob.md)              | §9.5                                      | 4    | Hecho     |
| 13  | [OpenAPI y colección Bruno](13-openapi-y-bruno.md)                   | §9.7                                      | 3    | Hecho     |
| 14  | [Calidad, accesibilidad y despliegue](14-calidad-y-despliegue.md)    | §4, §11, §14, §16, despliegue Vercel      | 4    | Pendiente |

## Formato de cada spec

Encabezado con estado → objetivo → trazabilidad con el enunciado → diseño → tareas (casillas) → pruebas →
definición de terminado → preguntas abiertas.
