<template>
  <q-card flat bordered class="dashboard-card">
    <q-card-section>
      <div class="row items-start justify-between no-wrap q-col-gutter-md">
        <div>
          <div class="text-subtitle1 text-weight-bold">Evaluation Rating Interpretation</div>
          <div class="text-caption text-grey-7">
            Evaluations grouped by their Total Average · {{ activeTermLabel || 'Active course-evaluation term' }}
          </div>
        </div>
        <q-badge v-if="!loading && !error" color="primary" rounded>
          {{ evaluatedCount }} evaluations
        </q-badge>
      </div>
    </q-card-section>

    <q-card-section class="chart-container">
      <q-banner v-if="error" dense rounded class="bg-red-1 text-negative">
        {{ error }}
      </q-banner>
      <div v-else-if="loading" class="loading-state">
        <q-spinner color="primary" size="32px" />
      </div>
      <div v-else-if="!evaluatedCount" class="empty-state text-grey-7">
        No non-draft evaluations with response data were found for this term.
      </div>
      <div v-else class="distribution-layout">
        <div class="distribution-chart">
          <apexchart
            type="donut"
            height="280"
            :options="chartOptions"
            :series="chartSeries[0].data"
          />
        </div>
        <div class="distribution-legend">
          <div
            v-for="item in interpretationSummary"
            :key="item.label"
            class="interpretation-row"
          >
            <div class="interpretation-row__heading">
              <span class="interpretation-label">
                <span class="interpretation-dot" :style="{ backgroundColor: item.color }"></span>
                {{ item.label }}
              </span>
              <span class="text-weight-bold">{{ item.count }}</span>
            </div>
            <q-linear-progress
              rounded
              size="7px"
              :value="item.percentage / 100"
              :color="item.quasarColor"
              track-color="grey-3"
            />
            <div class="text-caption text-grey-7 q-mt-xs">{{ item.percentage }}% of evaluations</div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'
import api from 'src/API/api.js'

const INTERPRETATIONS = [
  { label: 'Very Satisfied', color: '#18864b', quasarColor: 'positive' },
  { label: 'Satisfied', color: '#4b9b70', quasarColor: 'teal' },
  { label: 'Dissatisfied', color: '#e6a23c', quasarColor: 'warning' },
  { label: 'Very Dissatisfied', color: '#c83e4d', quasarColor: 'negative' }
]

export default {
  name: 'EvaluationInterpretationBreakdown',

  components: {
    apexchart: VueApexCharts
  },

  data () {
    return {
      loading: true,
      error: '',
      activeTermLabel: '',
      evaluatedCount: 0,
      chartSeries: [{ name: 'Evaluations', data: [] }],
      chartOptions: {
        chart: {
          type: 'donut',
          toolbar: { show: false },
          animations: { enabled: true }
        },
        colors: INTERPRETATIONS.map(item => item.color),
        labels: INTERPRETATIONS.map(item => item.label),
        stroke: {
          colors: ['#ffffff'],
          width: 3
        },
        plotOptions: {
          pie: {
            expandOnClick: false,
            donut: {
              size: '72%',
              labels: {
                show: true,
                name: {
                  show: true,
                  offsetY: 22,
                  color: '#667085',
                  fontSize: '13px'
                },
                value: {
                  show: true,
                  offsetY: -18,
                  color: '#202124',
                  fontSize: '28px',
                  fontWeight: 700,
                  formatter: value => String(value)
                },
                total: {
                  show: true,
                  showAlways: true,
                  label: 'Evaluations',
                  color: '#667085',
                  fontSize: '12px',
                  formatter: () => String(this.evaluatedCount)
                }
              }
            }
          }
        },
        dataLabels: {
          enabled: false
        },
        tooltip: {
          y: {
            formatter: (value, { globals }) => {
              const total = globals.seriesTotals.reduce((sum, count) => sum + count, 0)
              const percentage = total ? (value / total * 100).toFixed(1) : '0.0'
              return `${value} evaluations (${percentage}%)`
            }
          }
        },
        legend: { show: false },
        responsive: [{
          breakpoint: 600,
          options: {
            chart: { height: 250 },
            plotOptions: { pie: { donut: { size: '68%' } } }
          }
        }]
      }
    }
  },

  computed: {
    interpretationSummary () {
      const counts = this.chartSeries[0]?.data || []
      return INTERPRETATIONS.map((item, index) => {
        const count = counts[index] || 0
        return {
          ...item,
          count,
          percentage: this.evaluatedCount
            ? Number((count / this.evaluatedCount * 100).toFixed(1))
            : 0
        }
      })
    }
  },

  mounted () {
    this.loadDashboardData()
  },

  methods: {
    async loadDashboardData () {
      this.loading = true
      this.error = ''

      try {
        const termsResponse = await api.getAllAcademicTerms()
        if (!termsResponse || termsResponse.error || !termsResponse.success) {
          throw new Error('Unable to load academic terms.')
        }

        const activeTerm = (Array.isArray(termsResponse.data) ? termsResponse.data : []).find((term) => {
          const isActive = term.is_active === true || String(term.is_active).toLowerCase() === 'true'
          return isActive && String(term.type || '').toUpperCase() === 'COURSE_EVAL'
        })

        if (!activeTerm) {
          throw new Error('No active course-evaluation term is configured.')
        }

        this.activeTermLabel = `${activeTerm.acad_year} ${this.formatSemester(activeTerm.sem)}`

        const evaluationsResponse = await api.getEvaluations({
          acad_year: activeTerm.acad_year,
          sem: Number(activeTerm.sem)
        })
        if (!evaluationsResponse || evaluationsResponse.error || !evaluationsResponse.success) {
          throw new Error('Unable to load evaluations for the active term.')
        }

        const evaluations = (Array.isArray(evaluationsResponse.data) ? evaluationsResponse.data : [])
          .filter(evaluation => String(evaluation.status || 'DRAFT').toUpperCase() !== 'DRAFT')

        const results = await this.mapWithConcurrency(evaluations, 4, evaluation => this.getEvaluationInterpretation(evaluation))
        const counts = INTERPRETATIONS.map(() => 0)

        results.forEach((interpretationIndex) => {
          if (interpretationIndex !== null) counts[interpretationIndex] += 1
        })

        this.evaluatedCount = results.filter(result => result !== null).length
        this.chartSeries = [{ name: 'Evaluations', data: counts }]
      } catch (error) {
        console.error('Failed to load evaluation interpretation data', error)
        this.error = error.message || 'Unable to load evaluation interpretation data.'
      } finally {
        this.loading = false
      }
    },

    async getEvaluationInterpretation (evaluation) {
      const evaluationId = evaluation._id || evaluation.id || evaluation.evaluation_id
      if (!evaluationId) {
        throw new Error('An evaluation record is missing its ID.')
      }

      const [detailsResponse, statsResponse] = await Promise.all([
        api.getByEvaluation_Id(evaluationId),
        api.getResponseStatistics(evaluationId)
      ])

      if (!detailsResponse || detailsResponse.error || !detailsResponse.success) {
        throw new Error(`Unable to load evaluation details for ${evaluationId}.`)
      }
      if (!statsResponse || statsResponse.error || !statsResponse.success) {
        throw new Error(`Unable to load response statistics for ${evaluationId}.`)
      }

      const details = Array.isArray(detailsResponse.data) ? detailsResponse.data[0] : detailsResponse.data
      const indicators = this.normalizeIndicators(details)
      const statistics = Array.isArray(statsResponse.data) ? statsResponse.data : []

      if (!indicators.length || !statistics.some(stat => Number(stat.total_responses) > 0)) {
        return null
      }

      const averages = indicators
        .filter(indicator =>
          String(indicator.indicator_name || indicator.name || indicator.label || 'Indicator')
            .trim()
            .toLowerCase() !== 'overall'
        )
        .map((indicator) => {
          const items = indicator.evaluation_items || []
          const itemAverage = items.length
            ? items.reduce((sum, item) => {
                const stat = statistics.find(result =>
                  String(result.evaluation_item_id) === String(item.item_id)
                )
                const value = stat?.average_rating ?? item.mean ?? item.rating ?? item.value ?? 0
                return sum + Number(value || 0)
              }, 0) / items.length
            : 0

          return Number(indicator.mean ?? indicator.current_average ?? indicator.average ?? itemAverage)
        })
        .filter(Number.isFinite)

      if (!averages.length) return null

      const totalAverage = averages.reduce((sum, value) => sum + value, 0) / averages.length
      if (totalAverage >= 3.5) return 0
      if (totalAverage >= 2.5) return 1
      if (totalAverage >= 1.5) return 2
      return 3
    },

    normalizeIndicators (details) {
      if (!details) return []

      const indicators = details.indicators || details.evaluation_indicators || []
      const evaluationItems = details.evaluation_items || details.evaluationItems || []

      return indicators.map((indicator) => {
        const nestedItems = [indicator.evaluation_items, indicator.items, indicator.evaluationItems]
          .find(Array.isArray) || []
        const indicatorId = indicator._id || indicator.id || indicator.indicator_id
        const relatedItems = evaluationItems.filter((item) =>
          String(item.indicator_id || item.indicatorId || item.indicator_id_fk) === String(indicatorId)
        )
        const items = [...nestedItems, ...relatedItems].filter((item, index, allItems) => {
          const itemId = item._id || item.id || item.item_id
          return allItems.findIndex(candidate =>
            String(candidate._id || candidate.id || candidate.item_id) === String(itemId)
          ) === index
        })

        return {
          ...indicator,
          evaluation_items: items.map(item => ({
            ...item,
            item_id: item.item_id || item.id || item._id || null
          }))
        }
      })
    },

    async mapWithConcurrency (items, limit, callback) {
      const results = new Array(items.length)
      let nextIndex = 0

      const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (nextIndex < items.length) {
          const index = nextIndex
          nextIndex += 1
          results[index] = await callback(items[index])
        }
      })

      await Promise.all(workers)
      return results
    },

    formatSemester (semester) {
      const labels = { 21: '1st Semester', 22: '2nd Semester', 23: 'Summer' }
      return labels[Number(semester)] || `Semester ${semester}`
    }
  }
}
</script>

<style scoped>
.dashboard-card {
  height: 100%;
  min-width: 0;
  border-radius: 12px;
}

.chart-container {
  min-width: 0;
}

.distribution-layout {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(220px, 1fr);
  align-items: center;
  gap: 20px;
}

.distribution-chart {
  min-width: 0;
}

.distribution-legend {
  display: grid;
  gap: 18px;
  padding: 8px 12px;
}

.interpretation-row__heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.interpretation-label {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-weight: 500;
}

.interpretation-dot {
  width: 10px;
  height: 10px;
  flex: 0 0 10px;
  border-radius: 50%;
}

.loading-state,
.empty-state {
  display: grid;
  min-height: 280px;
  place-items: center;
  text-align: center;
}

@media (max-width: 700px) {
  .distribution-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }

  .distribution-chart {
    max-width: 380px;
    width: 100%;
    margin: 0 auto;
  }

  .distribution-legend {
    gap: 14px;
  }
}
</style>
