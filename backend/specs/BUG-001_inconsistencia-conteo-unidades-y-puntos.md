# BUG-001: Inconsistencia en conteo de unidades vendidas y cálculo de puntos

## Caso de prueba observado

**Vendedor:** ARTURO EMERSON DELGADO BARBOZA (ID de vendedor: 25)  
**Campaña:** Plan de Verano 2026  
**Ciclo:** Ciclo de Mayo (01 may 2026 – 31 may 2026)  
**Promedio mensual configurado:** 28  
**Meta (target_average):** 29 (28 + 28 × 1% crecimiento ≈ 29)

---

## Síntomas observados

### 1. El snapshot de `SellerDetailsView` muestra 36/29 unidades vendidas

- La tarjeta de "Historial de Ventas por Ciclo" muestra `totalUnitsSold = 36` y `targetAverage = 29`.
- Esto implica que el vendedor **ya superó** la meta de 29 unidades.

### 2. El reporte de `SalesPerformanceView` / Export Excel muestra solo 28 unidades

- La columna "Ventas Mes Actual" (`currentMonthSales`) del ranking de vendedores arroja **28 unidades**.
- Esta cifra se calcula con un query **completamente diferente** al snapshot.

### 3. El historial de ventas en `SalesView` muestra 36 unidades y puntos ganados antes del umbral

- Al sumar manualmente los ítems de las ventas (folio VTA-LFZWVHH5: M&Ms Milk 4 + M&Ms Peanut 2 = 6 unidades; folio VTA-RHBMK6EC: Snickers Minis 1 + Milky Way 10 + Snickers 13 = 24 unidades) = **30 unidades en estas dos ventas visibles**.
- Sin embargo, ya tiene **6 pts** en la primera venta y **2 pts** en la segunda = **8 pts totales**, lo cual sugiere que ya estaba ganando puntos.
- Los puntos ganados por ítem en la segunda venta: Snickers Minis = 2/2 (potenciales/ganados), Milky Way = 10/0.1, Snickers = 13/0 → esto muestra asignación parcial.

### 4. El número del snapshot (36) NO coincide con el conteo real de sale_items (≈30 visibles)

- Parece que puede haber ventas adicionales no visibles o un doble conteo en el snapshot.

---

## Análisis de las fuentes de datos (¿Por qué cada vista muestra números diferentes?)

### Fuente A: `SellerSalesSnapshot.total_units_sold` (usado en SellerDetailsView)

- **Archivo:** [`AverageBasedStrategy.php`](file:///wsl.localhost/Ubuntu/home/administrativo/proyectos/incentivos-app/incentivos-api/app/Services/Points/Strategies/AverageBasedStrategy.php#L94-L106)
- Se actualiza **incrementalmente** cada vez que se procesa una venta con `$snapshot->increment('total_units_sold', $currentSaleUnits)` (línea 106).
- `$currentSaleUnits` = `collect($resolvedItems)->sum('quantity')` → suma las cantidades de **todos** los ítems de la venta, **incluyendo ítems con `product_id = null`** (productos no reconocidos o inactivos).
- **Problema potencial:** Si un producto no reconocido tiene `product_id = null`, igual se suma su `quantity` al snapshot pero NO genera puntos. Esto infla el snapshot sin reflejarse en el ranking de analytics.

### Fuente B: `SalesAnalyticsService.getSellersComparison()` — subconsulta `currentMonthSales` (usado en SalesPerformanceView/Export)

- **Archivo:** [`SalesAnalyticsService.php`](file:///wsl.localhost/Ubuntu/home/administrativo/proyectos/incentivos-app/incentivos-api/app/Services/Analytics/SalesAnalyticsService.php#L180-L187)
- Calcula: `SUM(sale_items.quantity)` filtrado por `sale_date` del **mes actual** (`now()->startOfMonth()` a `now()->endOfMonth()`).
- **Diferencias clave vs. Fuente A:**
    1. **Filtro temporal diferente:** Fuente A filtra por `redemption_cycle_id` (el ciclo activo al momento de crear la venta). Fuente B filtra por `sale_date` dentro del mes actual con `now()`. Si hoy (4 junio 2026) se consulta, `now()->startOfMonth()` es 1 junio, no 1 mayo. **Las ventas de mayo NO aparecen en `currentMonthSales` de junio.**
    2. **Incluye items sin product_id:** La subconsulta `sale_items` hace un JOIN simple sin filtrar por `product_id IS NOT NULL`, así que debería incluir productos no reconocidos también. Sin embargo, el query principal filtra por `point_transactions.type = 'sale_earned'`, así que **solo aparecen vendedores que ganaron puntos al menos una vez**.

### Fuente C: `SalesAnalyticsService.getSellersComparison()` — subconsulta `currentSales` (también en SalesPerformanceView/Export)

- **Archivo:** [`SalesAnalyticsService.php`](file:///wsl.localhost/Ubuntu/home/administrativo/proyectos/incentivos-app/incentivos-api/app/Services/Analytics/SalesAnalyticsService.php#L171-L178)
- Calcula: `SUM(sale_items.quantity)` filtrado por `sale_date` dentro de la **campaña completa** (`campaign.start_date` a `campaign.end_date`).
- Debería ser más cercano al snapshot, pero aun así puede diferir si el ciclo y la campaña no coinciden exactamente.

---

## Teorías de las causas raíz

### TEORÍA 1: 🔴 Desfase temporal entre `currentMonthSales` y el ciclo del snapshot

**Probabilidad: ALTA**

El campo `currentMonthSales` usa `now()->startOfMonth()` a `now()->endOfMonth()`. Si el usuario consulta el ranking en **junio**, `currentMonthSales` solo muestra ventas de junio, no las de mayo. Pero el snapshot (`total_units_sold`) fue acumulado durante el **ciclo de mayo**. Esto explica perfectamente por qué el reporte del ranking muestra 28 (ventas de junio, o del periodo incorrecto) mientras el snapshot muestra 36 (acumulado del ciclo de mayo).

**Evidencia:** El ciclo es "01 may – 31 may 2026". La fecha actual es "04 jun 2026". Las 28 unidades podrían ser ventas registradas en junio, y las 36 son del ciclo de mayo.

### TEORÍA 2: 🟡 Inclusión de ítems con `product_id = null` en el snapshot

**Probabilidad: MEDIA**

En `AverageBasedStrategy.php` línea 103:

```php
$currentSaleUnits = (float) collect($resolvedItems)->sum('quantity');
```

`$resolvedItems` incluye ítems con `product_id = null` (SKU no reconocidos, productos inactivos). Estos ítems se cuentan para el snapshot pero **no generan puntos** (tienen `total_points = 0`). Esto infla artificialmente el `total_units_sold` del snapshot.

**Evidencia parcial:** En las imágenes se ve que los productos sí están reconocidos (M&Ms, Snickers, Milky Way), pero podría haber ventas anteriores con SKUs no reconocidos.

### TEORÍA 3: 🟡 El campo `goal` del snapshot no existe en la BD

**Probabilidad: MEDIA**

En `AverageBasedStrategy.php` líneas 96-100:

```php
$meta = ($snapshot->goal > 0) ? (float) $snapshot->goal : $meta;
if ($snapshot->goal <= 0) {
    $snapshot->update(['goal' => $meta]);
}
```

Y en `SellerDashboardService.php` líneas 122-123:

```php
if ($snapshot && $snapshot->goal > 0) {
    $targetValue = (float) $snapshot->goal;
}
```

**Pero la tabla `seller_sales_snapshots` NO tiene una columna `goal`** (las migraciones solo tienen `total_units_sold` y `target_average`). Esto significa que `$snapshot->goal` siempre retorna `null` (que en PHP es `<= 0`), y **la meta se recalcula cada vez**, lo cual debería estar bien, pero la escritura `$snapshot->update(['goal' => $meta])` **silenciosamente falla o crea un campo no mapeado**, dependiendo del modo estricto de Eloquent.

**Nota:** Si `goal` no es fillable ni existe en la tabla, `update(['goal' => $meta])` no hace nada. Esto no causa el bug directamente pero es código muerto que confunde la lógica.

### TEORÍA 4: 🟡 Los puntos se calculan ANTES de verificar el umbral correctamente

**Probabilidad: MEDIA**

En `AverageBasedStrategy.php` línea 126:

```php
$eligibleUnits = $newUnits - max($meta, $previousUnits);
```

Esto es correcto EN TEORÍA: si `previousUnits = 25` y `meta = 29`, y la nueva venta tiene 6 unidades (`newUnits = 31`), entonces `eligibleUnits = 31 - max(29, 25) = 31 - 29 = 2`. Solo 2 unidades ganan puntos. ✅

Pero si hay un error en el snapshot donde `previousUnits` está inflado (por la Teoría 2 o la Teoría 6), entonces el vendedor podría empezar a ganar puntos antes de lo esperado.

### TEORÍA 5: 🔴 El porcentaje de cumplimiento en `SellersRankingTable.tsx` se calcula mal

**Probabilidad: ALTA**

En [`SellersRankingTable.tsx`](file:///wsl.localhost/Ubuntu/home/administrativo/proyectos/incentivos-app/incentivos-webapp/src/feature/analytics/components/sales/SellersRankingTable.tsx#L92-L94):

```tsx
const average = seller.averageMonthlySales || 0;
const currentMonth = seller.currentMonthSales || 0;
const percentage = average > 0 ? Math.round((currentMonth / average) * 100) : 0;
```

Esto calcula `currentMonthSales / averageMonthlySales × 100`, pero **no usa la meta ajustada** (promedio + crecimiento). Además, `currentMonthSales` viene de la subconsulta que filtra por `now()->startOfMonth()` (ver Teoría 1), no del snapshot del ciclo.

### TEORÍA 6: 🔴 `increment()` no es idempotente — doble conteo por reintentos del job (Observación de Enrique L.)

**Probabilidad: ALTA — Confirmada con ejemplo en producción**

**Observación original de Enrique L. (03/Jun/2026):**

Enrique identificó que el `$snapshot->increment('total_units_sold', $currentSaleUnits)` en [`AverageBasedStrategy.php` L106](file:///wsl.localhost/Ubuntu/home/administrativo/proyectos/incentivos-app/incentivos-api/app/Services/Points/Strategies/AverageBasedStrategy.php#L106) **no es idempotente**. Si el proceso falla después del increment pero antes de completarse, y el job se reintenta, el snapshot se infla con un doble conteo.

**Ejemplo real de Enrique con MARCOS CAYETANO GOMEZ (ID 40):**

```
Promedio: 47 | Solo 2 ventas en la campaña

VENTA 1 (VTA-BEIRFZKX): 36 unidades → snapshot = 36 → NO genera puntos (36 < 47) ✓
VENTA 2 (VTA-GFZEWBBM): 11 unidades → DEBERÍA: snapshot = 47 → apenas llega, 0 puntos

PERO: Generó 9 puntos. ¿Cómo?
```

**La secuencia del bug según Enrique:**

```
1. Snapshot en DB = 36 (tras venta 1)
2. Job procesa venta 2 (11 unidades):
   - previousUnits = 36
   - newUnits = 36 + 11 = 47
   - $snapshot->increment('total_units_sold', 11) → DB = 47 ✍️ COMMITTED
   - if (47 <= 48.52) return 0; → Sale sin dar puntos
   - 💥 El job falla DESPUÉS del increment (timeout, excepción, etc.)

3. Redis reencola el job con los MISMOS datos originales:
   - previousUnits = 47 (lee el valor YA inflado)
   - newUnits = 47 + 11 = 58
   - $snapshot->increment('total_units_sold', 11) → DB = 58
   - if (58 <= 48.52) → FALSE → ENTRA a calcular puntos → ¡OTORGA PUNTOS ERRÓNEAMENTE!
```

**Mi análisis de esta teoría:**

Revisé el [`ProcessSalesFileJob.php`](file:///wsl.localhost/Ubuntu/home/administrativo/proyectos/incentivos-app/incentivos-api/app/Jobs/ProcessSalesFileJob.php) y encontré que:

```php
// Línea 88-101 de ProcessSalesFileJob.php
DB::transaction(function () use ($groups, $saleService, $distributor, $createdBy) {
    foreach ($groups as $group) {
        $saleService->persistOneSale(
            sellerId:     $group['seller_id'],
            ...
        );
    }
});
```

El job **SÍ envuelve `persistOneSale()` en un `DB::transaction()`**. En teoría, si la transacción falla, el `increment()` se revierte junto con todo lo demás.

**SIN EMBARGO**, hay escenarios donde el `DB::transaction()` NO protege:

1. **Timeout del worker:** Si el worker de PHP muere por timeout (`$timeout = 300` segundos, línea 31), el proceso se mata abruptamente. MySQL eventualmente hace rollback de transacciones huérfanas, pero **depende de `innodb_lock_wait_timeout` y la configuración del pool de conexiones**. Si la conexión se recicla antes del rollback automático, los cambios parciales podrían persistir.

2. **OOM Kill:** Si el sistema operativo mata el worker por uso excesivo de memoria, mismo escenario.

3. **La transacción envuelve TODO el foreach:** Si son 50 vendedores en el archivo y el vendedor #30 falla, se revierten TODOS los 30 — incluyendo los incrementos de los vendedores 1-29 que estaban correctos. Cuando el job se reintenta, **procesa de nuevo a los 50 vendedores**, y los snapshots de los vendedores 1-29 reciben un segundo increment.

4. **Excepción fuera de la transacción:** Si algo falla en la línea 103 (`ProcessedSalesFile::create`), DESPUÉS de que la transacción ya committeó exitosamente en la línea 101, el job falla con excepción, se reencola, y la SIGUIENTE ejecución vuelve a ejecutar la transacción — duplicando todos los incrementos.

**El punto #4 es especialmente peligroso:** la creación del registro `ProcessedSalesFile` está **FUERA** de la transacción. Si falla (ej: constraint violation, disco lleno), el job se reintenta y toda la transacción se ejecuta de nuevo.

**Propuesta de Enrique:**

```php
// Calcular desde la fuente de verdad (sale_items), no desde el snapshot
$previousUnits = SaleItem::whereHas('sale', function ($q) use ($seller, $sale, $activeCycle) {
    $q->where('seller_id', $seller->id)
      ->where('id', '!=', $sale->id)
      ->where('sale_date', '>=', $activeCycle->start_date)
      ->where('sale_date', '<=', $activeCycle->end_date);
})->sum('quantity');

$newUnits = $previousUnits + $currentSaleUnits;
$snapshot->update(['total_units_sold' => $newUnits]); // SET absoluto, no INCREMENT
```

**Mi evaluación de la propuesta:**

- ✅ **Es idempotente:** No importa cuántas veces se ejecute, el resultado es el mismo.
- ✅ **Usa la fuente de verdad:** Los `sale_items` reales, no un contador acumulado.
- ⚠️ **Rendimiento:** Agrega una subconsulta por cada venta, pero es aceptable dado el volumen.
- ⚠️ **Necesita cuidado con la venta actual:** El `where('id', '!=', $sale->id)` asume que la Sale ya fue creada (que sí, porque `persistOneSale` la crea antes de llamar a la strategy). ✓
- ⚠️ **Debe considerar el scope (cycle vs campaign):** La propuesta de Enrique usa `activeCycle->start_date/end_date`, pero si el `average_evaluation_scope` es `'campaign'`, debería usar las fechas de la campaña.

---

## Diagrama del flujo de datos y sus inconsistencias

```
┌────────────────────────┐
│   Venta registrada     │
│  (SaleService.php)     │
└──────────┬─────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ AverageBasedStrategy.calculatePoints()  │
│                                         │
│ 1. Busca/crea SellerSalesSnapshot       │
│ 2. Suma TODAS las quantities de items   │◄── Incluye items sin product_id
│ 3. Incrementa snapshot.total_units_sold │◄── ⚠️ NO idempotente (Teoría 6)
│ 4. Calcula eligible units vs meta       │
│ 5. Asigna puntos a items elegibles      │
└──────────┬──────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  SellerDetailsView (snapshot)            │
│  Muestra: snapshot.total_units_sold / 29 │──► 36 / 29 ✓ (Fuente A)
└──────────────────────────────────────────┘     ⚠️ Pero el 36 podría estar
                                                  inflado por reintentos

           ┌────────────────────────────────────────────────┐
           │  SalesPerformanceView / Export (ranking)        │
           │  Muestra: SUM(sale_items.quantity)              │
           │  WHERE sale_date BETWEEN                       │
           │    now()->startOfMonth() AND now()->endOfMonth()│──► 28 ✗ (Fuente B)
           │  (filtro de MES ACTUAL, no del ciclo)          │
           └────────────────────────────────────────────────┘

           ┌──────────────────────────────────────────────┐
           │  SalesView (historial ventas)                 │
           │  Muestra: registros individuales de Sale      │
           │  con sus SaleItems                            │──► 30+ unidades visibles
           │  Puntos ganados por ítem                      │    con puntos asignados
           └──────────────────────────────────────────────┘
```

### Diagrama del bug de idempotencia (Teoría 6)

```
ProcessSalesFileJob (tries = 3)
│
├─ INTENTO 1:
│   ├─ DB::transaction() {
│   │   ├─ persistOneSale(vendedor A) ─► increment snapshot A ✓
│   │   ├─ persistOneSale(vendedor B) ─► increment snapshot B ✓
│   │   └─ persistOneSale(vendedor C) ─► increment snapshot C ✓
│   │   } ─► COMMIT ✓
│   │
│   ├─ ProcessedSalesFile::create() ─► 💥 FALLA (fuera de la transacción)
│   └─ throw $e ─► Redis reencola
│
├─ INTENTO 2:
│   ├─ DB::transaction() {
│   │   ├─ persistOneSale(vendedor A) ─► DOBLE increment snapshot A ⚠️
│   │   ├─ persistOneSale(vendedor B) ─► DOBLE increment snapshot B ⚠️
│   │   └─ persistOneSale(vendedor C) ─► DOBLE increment snapshot C ⚠️
│   │   } ─► COMMIT ✓
│   │
│   └─ ProcessedSalesFile::create() ─► ✓ (o falla de nuevo...)
```

---

## Observaciones adicionales

### Observación sobre `SellersRankingTable.tsx`

El componente hace un llamado directo a la API (`api.get('/dashboard/sales/export')`) dentro del componente en lugar de usar la arquitectura separada de `api/`, `services/` que existe en `src/feature/analytics/`. Esto rompe el patrón establecido donde:

- `src/feature/analytics/api/` → llamadas HTTP
- `src/feature/analytics/services/` → hooks de React Query
- `src/feature/analytics/schemas/` → validación con Zod

La descarga del reporte debería estar en `analyticsAPI.ts` y el hook en `analyticsServices.ts`, no dentro del componente directamente.

### Observación sobre caché

`SalesAnalyticsService` usa `Cache::remember` con 15-20 minutos de TTL. Esto significa que después de registrar una venta, el ranking podría mostrar datos desactualizados por hasta 15 minutos. Si el admin revisa el ranking inmediatamente después de registrar una venta, verá datos viejos.

---

## Resumen de problemas identificados

| #   | Problema                                                                        | Severidad  | Impacto                                                                                                                                  |
| --- | ------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `currentMonthSales` usa `now()` en vez del rango del ciclo/campaña              | 🔴 Crítico | Los datos del ranking no coinciden con el snapshot cuando se consulta fuera del mes del ciclo                                            |
| 2   | `increment()` no idempotente — doble conteo por reintentos del job (Enrique L.) | 🔴 Crítico | El snapshot se infla y otorga puntos prematuramente. `ProcessedSalesFile::create()` FUERA de la transacción permite reintentos completos |
| 3   | El snapshot cuenta items con `product_id = null`                                | 🟡 Medio   | Infla `total_units_sold` artificialmente                                                                                                 |
| 4   | Campo `goal` inexistente en tabla `seller_sales_snapshots`                      | 🟡 Medio   | Código muerto que intenta escribir en columna inexistente                                                                                |
| 5   | `SellersRankingTable.tsx` calcula cumplimiento sin considerar la meta ajustada  | 🟡 Medio   | El % de cumplimiento en el ranking no refleja la meta real                                                                               |
| 6   | Llamado directo a API dentro de `SellersRankingTable.tsx`                       | 🟢 Bajo    | Viola el patrón arquitectónico del feature de analytics                                                                                  |
| 7   | Caché de 15 min en analytics causa datos desactualizados                        | 🟢 Bajo    | Confusión temporal tras registrar ventas                                                                                                 |

---

## Próximos pasos sugeridos

1. **Verificar en base de datos directamente** cuántas ventas y sale_items tiene ARTURO EMERSON DELGADO BARBOZA (seller_id=25) y MARCOS CAYETANO GOMEZ (seller_id=40) para el ciclo de mayo 2026 → comparar `SUM(sale_items.quantity)` vs `snapshot.total_units_sold`.
2. **Verificar si existen ventas duplicadas** creadas por reintentos del job (buscar `sale` con mismo `seller_id`, `sale_date`, y cantidades idénticas).
3. **Mover `ProcessedSalesFile::create()` DENTRO del `DB::transaction()`** en `ProcessSalesFileJob.php` para prevenir reintentos post-commit.
4. **Implementar la propuesta de Enrique:** Reemplazar `$snapshot->increment()` por un cálculo idempotente desde `sale_items`, adaptado al scope (cycle/campaign).
5. **Corregir la subconsulta `currentMonthSales`** para que use el rango del ciclo activo, no `now()->startOfMonth()`.
6. **Filtrar items con `product_id = null`** del conteo del snapshot en `AverageBasedStrategy`.
7. **Limpiar código muerto** del campo `goal` fantasma en `AverageBasedStrategy` y `SellerDashboardService`.
8. **Mover la llamada API del export** fuera de `SellersRankingTable.tsx` al módulo de `analyticsAPI.ts`.
