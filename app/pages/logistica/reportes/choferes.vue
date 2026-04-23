<script setup lang="ts">
definePageMeta({
  layout: 'logistica',
  middleware: ['auth']
})
import { getReporteChoferes } from '~/modulos/reportes/services/choferes.service'

// --- Types ---
interface ViajeChofer {
  id: string
  choferId: string
  nombre: string
  apellido: string
  chofer: string
  unidad: string
  despachoId: string
  numeroCarga: string
  fecha: string
  mes: string
  origenDestino: string
  origen: string
  destino: string
  cliente: string
  corredor: string | null
  numeroViaje: string
  tarifa: string
  adicional0: string
  tarifaTotal: string
  comisionChofer: string
  totalMesChofer: string
}

interface ReporteResponse {
  data: ViajeChofer[]
  total?: number
  page?: number
  limit?: number
}

// --- Filtros ---
const filters = reactive({
  fechaDesde: '',
  fechaHasta: '',
  choferId: '',
  mes: '',
  cliente: '',
  numeroViaje: '',
  page: 1,
  limit: 50
})

// --- Data ---
const clean = (v: string) => v?.trim() || undefined

const {
  data: reporteData,
  pending,
  refresh
} = await useAsyncData<ReporteResponse>(
  'reporte-choferes',
  async () => {
    const res = (await getReporteChoferes({
      fechaDesde: clean(filters.fechaDesde),
      fechaHasta: clean(filters.fechaHasta),
      choferId: clean(filters.choferId),
      mes: clean(filters.mes),
      cliente: clean(filters.cliente),
      numeroViaje: clean(filters.numeroViaje),
      page: filters.page,
      limit: filters.limit
    })) as ReporteResponse | ViajeChofer[]

    if (Array.isArray(res)) return { data: res }
    return res
  },
  {
    watch: [() => ({ ...filters })] // 👈 asegura reactividad correcta
  }
)
const viajes = computed<ViajeChofer[]>(() => reporteData.value?.data ?? [])

// -------------------------
// KPIs (USAN FILTRO)
// -------------------------
const totalTarifas = computed(() =>
  viajes.value.reduce((sum, v) => sum + parseFloat(v.tarifaTotal || '0'), 0)
)

const totalComisiones = computed(() =>
  viajes.value.reduce((sum, v) => sum + parseFloat(v.comisionChofer || '0'), 0)
)

const cantViajes = computed(() => viajes.value.length)

const tarifaPromedio = computed(() =>
  cantViajes.value ? totalTarifas.value / cantViajes.value : 0
)

// -------------------------
// AGRUPADOS (USAN FILTRO)
// -------------------------
const porChofer = computed(() => {
  const map: Record<string, any> = {}

  for (const v of viajes.value) {
    if (!map[v.choferId]) {
      map[v.choferId] = {
        chofer: v.chofer,
        comision: 0,
        viajes: 0,
        tarifa: 0
      }
    }

    map[v.choferId].comision += parseFloat(v.comisionChofer || '0')
    map[v.choferId].tarifa += parseFloat(v.tarifaTotal || '0')
    map[v.choferId].viajes++
  }

  return Object.values(map).sort((a, b) => b.comision - a.comision)
})

const porCliente = computed(() => {
  const map: Record<string, any> = {}

  for (const v of viajes.value) {
    const key = v.cliente || 'Sin cliente'
    if (!map[key]) map[key] = { cliente: key, comision: 0, viajes: 0 }

    map[key].comision += parseFloat(v.comisionChofer || '0')
    map[key].viajes++
  }

  return Object.values(map).sort((a, b) => b.viajes - a.viajes)
})

const porMes = computed(() => {
  const map: Record<string, any> = {}

  for (const v of viajes.value) {
    const key = v.mes ? v.mes.slice(0, 7) : 'Sin mes'

    if (!map[key]) {
      map[key] = { mes: key, comision: 0, tarifa: 0, viajes: 0 }
    }

    map[key].comision += parseFloat(v.comisionChofer || '0')
    map[key].tarifa += parseFloat(v.tarifaTotal || '0')
    map[key].viajes++
  }

  return Object.values(map).sort((a, b) =>
    String(a.mes).localeCompare(String(b.mes))
  )
})

const rutasFrecuentes = computed(() => {
  const map: Record<string, number> = {}

  for (const v of viajes.value) {
    map[v.origenDestino] = (map[v.origenDestino] || 0) + 1
  }

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([ruta, count]) => ({ ruta, count }))
})

// -------------------------
// SORTING (igual pero con filtrados)
// -------------------------
const sortedViajes = computed(() => {
  return [...viajes.value].sort((a, b) => {
    const av = a[sortKey.value] ?? ''
    const bv = b[sortKey.value] ?? ''

    const cmp = String(av).localeCompare(String(bv), undefined, {
      numeric: true
    })

    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

// --- SVG Bar chart ---
const BAR_HEIGHT = 36
const BAR_GAP = 10
const CHART_LEFT = 160
const CHART_RIGHT = 40
const CHART_WIDTH = 580

function barChartHeight(n: number) {
  return n * (BAR_HEIGHT + BAR_GAP) + 20
}
function barWidth(value: number, max: number) {
  const available = CHART_WIDTH - CHART_LEFT - CHART_RIGHT
  return Math.max(2, (value / max) * available)
}
const maxComision = computed(() =>
  Math.max(...porChofer.value.map((c) => c.comision), 1)
)
const maxMesTarifa = computed(() =>
  Math.max(...porMes.value.map((m) => m.tarifa), 1)
)

// --- Donut ---
const DONUT_R = 70
const DONUT_CX = 120
const DONUT_CY = 120
const clienteColors = [
  '#F59E0B',
  '#3B82F6',
  '#10B981',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4'
]

function donutSlices() {
  const total = porCliente.value.reduce((s, c) => s + c.viajes, 0)
  let angle = -Math.PI / 2
  return porCliente.value.slice(0, 7).map((c, i) => {
    const frac = c.viajes / total
    const start = angle
    const end = angle + frac * 2 * Math.PI
    angle = end
    const x1 = DONUT_CX + DONUT_R * Math.cos(start)
    const y1 = DONUT_CY + DONUT_R * Math.sin(start)
    const x2 = DONUT_CX + DONUT_R * Math.cos(end)
    const y2 = DONUT_CY + DONUT_R * Math.sin(end)
    const large = frac > 0.5 ? 1 : 0
    const inner = 45
    const ix1 = DONUT_CX + inner * Math.cos(start)
    const iy1 = DONUT_CY + inner * Math.sin(start)
    const ix2 = DONUT_CX + inner * Math.cos(end)
    const iy2 = DONUT_CY + inner * Math.sin(end)
    return {
      d: `M ${ix1} ${iy1} L ${x1} ${y1} A ${DONUT_R} ${DONUT_R} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 ${large} 0 ${ix1} ${iy1} Z`,
      color: clienteColors[i % clienteColors.length],
      label: c.cliente,
      viajes: c.viajes,
      pct: Math.round(frac * 100)
    }
  })
}

// --- Line chart ---
const LINE_W = 480
const LINE_H = 120
const LINE_PAD = { top: 12, right: 20, bottom: 24, left: 60 }

function linePoints(values: number[], max: number) {
  if (values.length < 2) return ''
  const w = LINE_W - LINE_PAD.left - LINE_PAD.right
  const h = LINE_H - LINE_PAD.top - LINE_PAD.bottom
  return values
    .map((v, i) => {
      const x = LINE_PAD.left + (i / (values.length - 1)) * w
      const y = LINE_PAD.top + h - (v / max) * h
      return `${x},${y}`
    })
    .join(' ')
}

// --- Formato ---
function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(n)
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}
function fmtMes(mesKey: string) {
  const [y, m] = mesKey.split('-')
  const names = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic'
  ]
  return `${names[parseInt(m) - 1]} ${y.slice(2)}`
}

// --- Sorting ---
const sortKey = ref<keyof ViajeChofer>('fecha')
const sortDir = ref<'asc' | 'desc'>('asc')
function toggleSort(key: keyof ViajeChofer) {
  if (sortKey.value === key)
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

// UPageHeader links
const headerLinks = computed(() => [
  {
    label: pending.value ? 'Actualizando...' : 'Actualizar',
    icon: 'i-lucide-refresh-cw',
    color: 'primary' as const,
    onClick: refresh,
    disabled: pending.value
  }
])

function shortName(nombre?: string | null) {
  if (!nombre) return '—'
  const parts = nombre.split(' ')
  return `${parts[0] || ''} ${parts[1]?.[0] || ''}.`
}
</script>

<template>
  <UPage class="space-y-4">
    <UPageHeader
      title="Comisiones de Choferes"
      description="Reporte de comisiones y viajes por chofer"
      :links="headerLinks"
    />

    <!-- FILTROS -->
    <section class="rch-filters">
      <div class="rch-filters-grid">
        <label class="rch-field">
          <span>Desde</span>
          <input type="date" v-model="filters.fechaDesde" class="rch-input" />
        </label>
        <label class="rch-field">
          <span>Hasta</span>
          <input type="date" v-model="filters.fechaHasta" class="rch-input" />
        </label>
        <label class="rch-field">
          <span>Mes</span>
          <input type="month" v-model="filters.mes" class="rch-input" />
        </label>
        <label class="rch-field">
          <span>N° Viaje</span>
          <input
            type="text"
            v-model="filters.numeroViaje"
            class="rch-input"
            placeholder="Buscar viaje..."
          />
        </label>
        <label class="rch-field">
          <span>Cliente</span>
          <input
            type="text"
            v-model="filters.cliente"
            class="rch-input"
            placeholder="Todos"
          />
        </label>
      </div>
    </section>

    <!-- KPIs -->
    <section class="rch-kpis">
      <div class="rch-kpi rch-kpi--accent">
        <span class="rch-kpi-label">Total Comisiones</span>
        <span class="rch-kpi-val">{{ fmt(totalComisiones) }}</span>
        <span class="rch-kpi-sub">a pagar a choferes</span>
      </div>
      <div class="rch-kpi">
        <span class="rch-kpi-label">Facturación Total</span>
        <span class="rch-kpi-val">{{ fmt(totalTarifas) }}</span>
        <span class="rch-kpi-sub">suma de tarifas</span>
      </div>
      <div class="rch-kpi">
        <span class="rch-kpi-label">Viajes</span>
        <span class="rch-kpi-val">{{ cantViajes }}</span>
        <span class="rch-kpi-sub">en el período</span>
      </div>
      <div class="rch-kpi">
        <span class="rch-kpi-label">Tarifa Promedio</span>
        <span class="rch-kpi-val">{{ fmt(tarifaPromedio) }}</span>
        <span class="rch-kpi-sub">por viaje</span>
      </div>
      <div class="rch-kpi">
        <span class="rch-kpi-label">% Comisión</span>
        <span class="rch-kpi-val">
          {{
            totalTarifas
              ? ((totalComisiones / totalTarifas) * 100).toFixed(1)
              : 0
          }}%
        </span>
        <span class="rch-kpi-sub">sobre facturación</span>
      </div>
    </section>

    <!-- CHARTS ROW 1 -->
    <section class="rch-charts-row">
      <!-- Bar: comisiones por chofer -->
      <div class="rch-card rch-card--wide">
        <h2 class="rch-card-title">Comisiones por Chofer</h2>
        <div class="rch-chart-scroll">
          <svg
            :width="CHART_WIDTH"
            :height="barChartHeight(porChofer.length)"
            class="rch-svg"
          >
            <g v-for="(c, i) in porChofer" :key="c.chofer">
              <text
                :x="CHART_LEFT - 8"
                :y="20 + i * (BAR_HEIGHT + BAR_GAP) + BAR_HEIGHT / 2 + 4"
                text-anchor="end"
                class="rch-bar-label"
              >
                {{ shortName(c.chofer) }}
              </text>
              <rect
                :x="CHART_LEFT"
                :y="20 + i * (BAR_HEIGHT + BAR_GAP)"
                :width="CHART_WIDTH - CHART_LEFT - CHART_RIGHT"
                :height="BAR_HEIGHT"
                class="rch-bar-bg"
              />
              <rect
                :x="CHART_LEFT"
                :y="20 + i * (BAR_HEIGHT + BAR_GAP)"
                :width="barWidth(c.comision, maxComision)"
                :height="BAR_HEIGHT"
                class="rch-bar-fill"
              />
              <rect
                :x="CHART_LEFT"
                :y="20 + i * (BAR_HEIGHT + BAR_GAP) + BAR_HEIGHT - 4"
                :width="
                  barWidth(
                    c.viajes *
                      (maxComision /
                        Math.max(...porChofer.map((x) => x.viajes), 1)),
                    maxComision
                  )
                "
                :height="4"
                class="rch-bar-viajes"
              />
              <text
                :x="CHART_LEFT + barWidth(c.comision, maxComision) + 6"
                :y="20 + i * (BAR_HEIGHT + BAR_GAP) + BAR_HEIGHT / 2 + 4"
                class="rch-bar-val"
              >
                {{ fmt(c.comision) }}
              </text>
              <text
                :x="CHART_LEFT + barWidth(c.comision, maxComision) + 6"
                :y="20 + i * (BAR_HEIGHT + BAR_GAP) + BAR_HEIGHT / 2 + 16"
                class="rch-bar-sub"
              >
                {{ c.viajes }} viaje{{ c.viajes !== 1 ? 's' : '' }}
              </text>
            </g>
          </svg>
        </div>
        <div class="rch-legend">
          <span class="rch-legend-item">
            <span class="rch-legend-box rch-legend-box--accent"></span>
            Comisión
          </span>
          <span class="rch-legend-item">
            <span class="rch-legend-box rch-legend-box--viajes"></span>
            Viajes (rel.)
          </span>
        </div>
      </div>

      <!-- Donut: clientes -->
      <div class="rch-card">
        <h2 class="rch-card-title">Viajes por Cliente</h2>
        <svg width="240" height="240" class="rch-svg rch-donut">
          <g v-for="s in donutSlices()" :key="s.label">
            <path :d="s.d" :fill="s.color" class="rch-donut-path" />
          </g>
          <text
            x="120"
            y="114"
            text-anchor="middle"
            class="rch-donut-center-num"
          >
            {{ cantViajes }}
          </text>
          <text
            x="120"
            y="132"
            text-anchor="middle"
            class="rch-donut-center-label"
          >
            viajes
          </text>
        </svg>
        <ul class="rch-donut-legend">
          <li v-for="s in donutSlices()" :key="s.label" class="rch-donut-li">
            <span class="rch-donut-dot" :style="{ background: s.color }"></span>
            <span class="rch-donut-name">{{ s.label }}</span>
            <span class="rch-donut-pct">{{ s.pct }}%</span>
            <span class="rch-donut-cnt">{{ s.viajes }}v</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- CHARTS ROW 2 -->
    <section class="rch-charts-row">
      <!-- Line: evolución mensual -->
      <div class="rch-card rch-card--wide" v-if="porMes.length > 1">
        <h2 class="rch-card-title">Evolución Mensual</h2>
        <svg :width="LINE_W" :height="LINE_H + 8" class="rch-svg">
          <g v-for="n in 4" :key="n">
            <line
              :x1="LINE_PAD.left"
              :y1="
                LINE_PAD.top +
                ((LINE_H - LINE_PAD.top - LINE_PAD.bottom) / 4) * (n - 1)
              "
              :x2="LINE_W - LINE_PAD.right"
              :y2="
                LINE_PAD.top +
                ((LINE_H - LINE_PAD.top - LINE_PAD.bottom) / 4) * (n - 1)
              "
              class="rch-gridline"
            />
          </g>
          <polygon
            :points="`${LINE_PAD.left},${LINE_PAD.top + LINE_H - LINE_PAD.top - LINE_PAD.bottom} ${linePoints(
              porMes.map((m) => m.tarifa),
              maxMesTarifa
            )} ${LINE_W - LINE_PAD.right},${LINE_PAD.top + LINE_H - LINE_PAD.top - LINE_PAD.bottom}`"
            class="rch-area-tarifa"
          />
          <polyline
            :points="
              linePoints(
                porMes.map((m) => m.tarifa),
                maxMesTarifa
              )
            "
            class="rch-line-tarifa"
          />
          <polygon
            :points="`${LINE_PAD.left},${LINE_PAD.top + LINE_H - LINE_PAD.top - LINE_PAD.bottom} ${linePoints(
              porMes.map((m) => m.comision),
              maxMesTarifa
            )} ${LINE_W - LINE_PAD.right},${LINE_PAD.top + LINE_H - LINE_PAD.top - LINE_PAD.bottom}`"
            class="rch-area-comision"
          />
          <polyline
            :points="
              linePoints(
                porMes.map((m) => m.comision),
                maxMesTarifa
              )
            "
            class="rch-line-comision"
          />
          <g v-for="(m, i) in porMes" :key="m.mes">
            <circle
              :cx="
                LINE_PAD.left +
                (i / (porMes.length - 1)) *
                  (LINE_W - LINE_PAD.left - LINE_PAD.right)
              "
              :cy="
                LINE_PAD.top +
                (LINE_H - LINE_PAD.top - LINE_PAD.bottom) -
                (m.comision / maxMesTarifa) *
                  (LINE_H - LINE_PAD.top - LINE_PAD.bottom)
              "
              r="4"
              class="rch-dot-comision"
            />
            <text
              :x="
                LINE_PAD.left +
                (i / (porMes.length - 1)) *
                  (LINE_W - LINE_PAD.left - LINE_PAD.right)
              "
              :y="LINE_H - 4"
              text-anchor="middle"
              class="rch-axis-label"
            >
              {{ fmtMes(m.mes) }}
            </text>
          </g>
        </svg>
        <div class="rch-legend">
          <span class="rch-legend-item">
            <span class="rch-legend-box rch-legend-box--tarifa"></span>
            Facturación
          </span>
          <span class="rch-legend-item">
            <span class="rch-legend-box rch-legend-box--accent"></span>
            Comisiones
          </span>
        </div>
      </div>

      <!-- Rutas frecuentes -->
      <div class="rch-card">
        <h2 class="rch-card-title">Rutas Frecuentes</h2>
        <ul class="rch-rutas">
          <li
            v-for="(r, i) in rutasFrecuentes"
            :key="r.ruta"
            class="rch-ruta-item"
          >
            <span class="rch-ruta-rank">{{ i + 1 }}</span>
            <span class="rch-ruta-nombre">{{ r.ruta }}</span>
            <span class="rch-ruta-badge">{{ r.count }}x</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- RESUMEN PAGO POR CHOFER -->
    <section class="rch-section">
      <h2 class="rch-section-title">Resumen de Pago por Chofer</h2>
      <div class="rch-table-wrap">
        <table class="rch-table">
          <thead>
            <tr>
              <th>Chofer</th>
              <th class="rch-th-right">Viajes</th>
              <th class="rch-th-right">Facturación</th>
              <th class="rch-th-right">Comisión Total</th>
              <th class="rch-th-right">% Comisión</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in porChofer" :key="c.chofer" class="rch-tr-pago">
              <td class="rch-td-chofer">{{ c.chofer }}</td>
              <td class="rch-td-right rch-td-num">{{ c.viajes }}</td>
              <td class="rch-td-right">{{ fmt(c.tarifa) }}</td>
              <td class="rch-td-right rch-td-comision">
                {{ fmt(c.comision) }}
              </td>
              <td class="rch-td-right">
                {{ c.tarifa ? ((c.comision / c.tarifa) * 100).toFixed(1) : 0 }}%
              </td>
            </tr>
            <tr class="rch-tr-total">
              <td>TOTAL</td>
              <td class="rch-td-right">{{ cantViajes }}</td>
              <td class="rch-td-right">{{ fmt(totalTarifas) }}</td>
              <td class="rch-td-right">{{ fmt(totalComisiones) }}</td>
              <td class="rch-td-right">
                {{
                  totalTarifas
                    ? ((totalComisiones / totalTarifas) * 100).toFixed(1)
                    : 0
                }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- DETALLE DE VIAJES -->
    <section class="rch-section">
      <h2 class="rch-section-title">Detalle de Viajes</h2>
      <div class="rch-table-wrap">
        <table class="rch-table">
          <thead>
            <tr>
              <th @click="toggleSort('fecha')" class="rch-th-sort">
                Fecha
                <span class="rch-sort-arrow">
                  {{
                    sortKey === 'fecha' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'
                  }}
                </span>
              </th>
              <th @click="toggleSort('numeroViaje')" class="rch-th-sort">
                N° Viaje
              </th>
              <th @click="toggleSort('numeroCarga')" class="rch-th-sort">
                Nº Carga
              </th>
              <th @click="toggleSort('chofer')" class="rch-th-sort">Chofer</th>
              <th>Unidad</th>
              <th @click="toggleSort('origenDestino')" class="rch-th-sort">
                Ruta
              </th>
              <th @click="toggleSort('cliente')" class="rch-th-sort">
                Cliente
              </th>
              <th class="rch-th-right" @click="toggleSort('tarifaTotal')">
                Tarifa
              </th>
              <th
                class="rch-th-right rch-th-accent"
                @click="toggleSort('comisionChofer')"
              >
                Comisión
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in sortedViajes" :key="v.id" class="rch-tr">
              <td class="rch-td-date">{{ fmtDate(v.fecha) }}</td>

              <td class="rch-td-mono">{{ v.numeroViaje }}</td>

              <td class="rch-td-mono">{{ v.numeroCarga }}</td>

              <td class="rch-td-chofer">{{ v.chofer }}</td>

              <td class="rch-td-center rch-td-mono">{{ v.unidad }}</td>

              <td class="rch-td-ruta">{{ v.origenDestino }}</td>

              <td>
                <span class="rch-badge">{{ v.cliente }}</span>
              </td>

              <td class="rch-td-right">
                {{ fmt(parseFloat(v.tarifaTotal)) }}
              </td>

              <td class="rch-td-right rch-td-comision-detail">
                {{ fmt(parseFloat(v.comisionChofer)) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!pending && viajes.length === 0" class="rch-empty">
        No hay viajes para los filtros seleccionados.
      </p>
    </section>
  </UPage>
</template>

<style scoped>
/* FILTROS */
.rch-filters {
  border-bottom: 1px solid var(--ui-border);
  padding: 14px 0;
  margin-bottom: 8px;
}
.rch-filters-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.rch-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--ui-text-muted);
  text-transform: uppercase;
}
.rch-input {
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  color: var(--ui-text);
  padding: 6px 10px;
  font-size: 12px;
  outline: none;
  border-radius: var(--ui-radius);
  transition: border-color 0.15s;
  min-width: 140px;
}
.rch-input:focus {
  border-color: var(--ui-primary);
}

/* KPIS */
.rch-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.rch-kpi {
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  padding: 16px 18px;
  border-radius: var(--ui-radius);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rch-kpi--accent {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 6%, var(--ui-bg-elevated));
}
.rch-kpi-label {
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
}
.rch-kpi-val {
  font-size: 20px;
  font-weight: 700;
  color: var(--ui-text);
  letter-spacing: -0.5px;
}
.rch-kpi--accent .rch-kpi-val {
  color: var(--ui-primary);
}
.rch-kpi-sub {
  font-size: 10px;
  color: var(--ui-text-muted);
}

/* CHARTS */
.rch-charts-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-bottom: 20px;
}
.rch-card {
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  padding: 20px;
  flex: 1 1 260px;
}
.rch-card--wide {
  flex: 2 1 500px;
}
.rch-card-title {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
  margin: 0 0 16px;
}

/* BAR CHART */
.rch-chart-scroll {
  overflow-x: auto;
  overflow-y: visible;
}
.rch-svg {
  display: block;
  overflow: visible;
}
.rch-bar-label {
  font-size: 11px;
  fill: var(--ui-text-muted);
  white-space: nowrap;
}

.rch-bar-bg {
  fill: var(--ui-bg);
}
.rch-bar-fill {
  fill: var(--ui-primary);
  opacity: 0.9;
}
.rch-bar-viajes {
  fill: #60a5fa;
  opacity: 0.55;
}
.rch-bar-val {
  font-size: 13px;
  font-weight: 700;
  fill: var(--ui-text);
  white-space: nowrap;
}
.rch-bar-sub {
  font-size: 10px;
  fill: var(--ui-text-muted);
  white-space: nowrap;
}

/* LEGEND */
.rch-legend {
  display: flex;
  gap: 16px;
  margin-top: 10px;
}
.rch-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--ui-text-muted);
}
.rch-legend-box {
  width: 14px;
  height: 8px;
  display: inline-block;
  border-radius: 2px;
}
.rch-legend-box--accent {
  background: var(--ui-primary);
}
.rch-legend-box--viajes {
  background: #3b82f6;
}
.rch-legend-box--tarifa {
  background: #3b82f6;
  opacity: 0.5;
}

/* DONUT */
.rch-donut {
  display: block;
  margin: 0 auto;
}
.rch-donut-path {
  transition: opacity 0.15s;
  stroke: var(--ui-bg-elevated);
  stroke-width: 2;
}
.rch-donut-path:hover {
  opacity: 0.8;
}
.rch-donut-center-num {
  font-size: 26px;
  font-weight: 700;
  fill: var(--ui-text);
}
.rch-donut-center-label {
  font-size: 11px;
  fill: var(--ui-text-muted);
}
.rch-donut-legend {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
}
.rch-donut-li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid var(--ui-border);
  font-size: 11px;
}
.rch-donut-li:last-child {
  border-bottom: none;
}
.rch-donut-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.rch-donut-name {
  flex: 1;
  color: var(--ui-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rch-donut-pct {
  color: var(--ui-text-muted);
  min-width: 32px;
  text-align: right;
}
.rch-donut-cnt {
  color: var(--ui-primary);
  min-width: 24px;
  text-align: right;
  font-weight: 700;
}

/* LINE CHART */
.rch-gridline {
  stroke: var(--ui-border);
  stroke-width: 1;
}
.rch-area-tarifa {
  fill: #3b82f6;
  opacity: 0.08;
}
.rch-area-comision {
  fill: var(--ui-primary);
  opacity: 0.12;
}
.rch-line-tarifa {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
  opacity: 0.6;
}
.rch-line-comision {
  fill: none;
  stroke: var(--ui-primary);
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.rch-dot-comision {
  fill: var(--ui-primary);
  stroke: var(--ui-bg-elevated);
  stroke-width: 2;
}
.rch-axis-label {
  font-size: 9px;
  fill: var(--ui-text-muted);
}

/* RUTAS */
.rch-rutas {
  list-style: none;
  padding: 0;
  margin: 0;
}
.rch-ruta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--ui-border);
}
.rch-ruta-item:last-child {
  border-bottom: none;
}
.rch-ruta-rank {
  width: 20px;
  height: 20px;
  background: var(--ui-bg);
  color: var(--ui-primary);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 4px;
}
.rch-ruta-nombre {
  flex: 1;
  font-size: 11px;
  color: var(--ui-text);
}
.rch-ruta-badge {
  background: color-mix(in srgb, #3b82f6 15%, transparent);
  color: #3b82f6;
  border: 1px solid #3b82f6;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
}

/* SECTION */
.rch-section {
  margin-bottom: 24px;
}
.rch-section-title {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
  margin: 0 0 12px;
}

/* TABLES */
.rch-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
}
.rch-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--ui-bg-elevated);
}
.rch-table thead th {
  background: var(--ui-bg);
  padding: 10px 14px;
  text-align: left;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
  border-bottom: 1px solid var(--ui-border);
  white-space: nowrap;
  user-select: none;
}
.rch-th-sort {
  cursor: pointer;
}
.rch-th-sort:hover {
  color: var(--ui-text);
}
.rch-sort-arrow {
  margin-left: 4px;
  opacity: 0.5;
}
.rch-th-right {
  text-align: right;
}
.rch-th-accent {
  color: var(--ui-primary) !important;
}
.rch-tr {
  border-bottom: 1px solid var(--ui-border);
}
.rch-tr:hover td {
  background: var(--ui-bg);
}
.rch-tr td {
  padding: 9px 14px;
}
.rch-tr-pago td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--ui-border);
}
.rch-tr-pago:hover td {
  background: var(--ui-bg);
}
.rch-tr-total td {
  padding: 12px 14px;
  border-top: 2px solid var(--ui-primary);
  font-size: 12px;
  font-weight: 700;
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 5%, var(--ui-bg-elevated));
}
.rch-td-date {
  color: var(--ui-text-muted);
  white-space: nowrap;
}
.rch-td-mono {
  font-size: 11px;
  color: var(--ui-text-muted);
}
.rch-td-center {
  text-align: center;
}
.rch-td-chofer {
  font-weight: 600;
  white-space: nowrap;
}
.rch-td-ruta {
  font-size: 11px;
  color: var(--ui-text-muted);
}
.rch-td-right {
  text-align: right;
}
.rch-td-num {
  text-align: right;
  font-size: 12px;
  font-weight: 700;
}
.rch-td-comision {
  color: var(--ui-primary);
  font-weight: 700;
}
.rch-td-comision-detail {
  color: var(--ui-primary);
  font-weight: 600;
}
.rch-badge {
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  font-size: 10px;
  padding: 2px 7px;
  white-space: nowrap;
  border-radius: 4px;
}
.rch-empty {
  padding: 32px;
  text-align: center;
  color: var(--ui-text-muted);
}
</style>
