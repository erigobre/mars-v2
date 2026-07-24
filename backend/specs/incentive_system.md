# Sistema de Incentivos

## Conceptos Generales

El sistema de incentivos se basa en premiar a los vendedores de distribuidores según sus ventas y el cumplimiento de metas dentro de periodos específicos. A continuación, se detallan los conceptos principales.

### 1. Campañas (`campaigns`)
Una campaña es el contenedor principal del sistema de incentivos. 
- Tiene un nombre, una fecha de inicio (`start_date`) y una fecha de fin (`end_date`).
- Suele durar periodos largos (por ejemplo, 3 meses).
- Determina si el sistema está activo o no durante ese lapso de tiempo.

### 2. Ciclos de Redención o Periodos (`redemption_cycles`)
Dentro de una campaña, el tiempo se divide en "Ciclos" o "Periodos". 
- Cada ciclo pertenece a una campaña (`campaign_id`).
- Tiene su propia fecha de inicio (`start_date`) y fin (`end_date`).
- Por ejemplo, si una campaña dura 3 meses, puede haber ciclos mensuales, quincenales, o semanales.

### 3. Ventanas de Redención (`redemption_windows`)
Dentro de cada ciclo de redención, existen ventanas de tiempo específicas en las que los vendedores pueden redimir (canjear) los puntos que han ganado.
- Pertenecen a un ciclo (`cycle_id`).
- Tienen fecha de apertura (`opens_at`) y cierre (`closes_at`).
- Ejemplo: De viernes a domingo al final del ciclo.

### 4. Metas (`goals`)
Las metas son los objetivos que los vendedores deben cumplir durante un ciclo para ganar puntos o bonificaciones.
- Están atadas a un ciclo específico (`cycle_id`).
- Pueden ser de diferentes tipos (`type`), como monto total de ventas (`TOTAL_SALES_AMOUNT`) o cantidad específica de producto (`SPECIFIC_PRODUCT_QTY`).
- Tienen un valor objetivo (`target_value`) y una cantidad de puntos de recompensa (`reward_points`).

### 5. Progreso de Metas de los Vendedores (`seller_goal_progress`)
Registra el avance de cada vendedor respecto a las metas.
- Muestra el valor actual (`current_value`).
- Indica si la meta fue alcanzada (`reached`) y si se otorgó el bono (`bonus_awarded`).

### 6. Rendimiento y Ventas (`seller_sales_snapshots`)
Se guardan capturas (snapshots) de las ventas de cada vendedor.
- Se acumulan las unidades vendidas (`total_units_sold`).
- Se relacionan tanto a la campaña (`campaign_id`) como al ciclo de redención (`redemption_cycle_id`), lo cual es crucial para medir el rendimiento por periodo y no solo por mes o campaña global.
- También se guarda la meta específica ajustada de cada vendedor (`goal`).

## Cálculo de Metas
La meta de un vendedor para un ciclo particular se calcula tomando en cuenta:
1. **Promedio de Ventas Mensual:** Lo que el vendedor vende regularmente al mes.
2. **Crecimiento Esperado del Distribuidor:** El porcentaje de crecimiento que se espera del distribuidor al que pertenece el vendedor.

**Fórmula Básica:**
`Meta = Promedio Mensual + (Promedio Mensual * Crecimiento Distribuidor)`

**Consideración de Tiempos:**
Dado que la meta base suele estar en términos mensuales y los ciclos pueden durar menos (ej. semanas o quincenas), la lógica del sistema debe hacer la proporción adecuada (prorrateo) para que la meta exigida corresponda a la duración del ciclo, en lugar de exigir la meta de todo un mes en un periodo más corto.
