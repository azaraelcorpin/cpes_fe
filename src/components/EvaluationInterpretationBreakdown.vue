<template>
  <q-card flat bordered class="dashboard-card">
    <q-card-section>
      <div class="row items-start justify-between no-wrap q-col-gutter-md">
        <div>
          <div class="text-subtitle1 text-weight-bold">{{ title }}</div>
          <div class="text-caption text-grey-7">
            Evaluations grouped by their Total Average · {{ activeTermLabel }}
          </div>
        </div>
        <q-badge v-if="!loading" color="primary" rounded>
          {{ evaluatedCount }} evaluations
        </q-badge>
      </div>
    </q-card-section>

    <q-card-section class="chart-container" :class="{ 'chart-container--drawer-open': selectedInterpretation }">
      <div v-if="loading" class="loading-state">
        <q-spinner color="primary" size="32px" />
      </div>
      <div v-else-if="!evaluatedCount" class="empty-state text-grey-7">
        No non-draft evaluations with response data were found for this evaluation term.
      </div>
      <div v-else class="interpretation-content">
        <aside class="evaluation-drawer" :class="{ 'evaluation-drawer--open': selectedInterpretation }">
          <div v-if="selectedInterpretation" class="evaluation-drawer__content">
            <div class="row items-center justify-between q-mb-sm no-wrap">
              <div class="col">
                <div class="text-subtitle2 text-weight-bold">{{ selectedInterpretation?.label }} evaluations</div>
                <div class="text-caption text-grey-7">
                  {{ selectedEvaluations.length }} evaluation{{ selectedEvaluations.length === 1 ? '' : 's' }}
                </div>
              </div>
              <q-btn
                flat
                round
                dense
                icon="close"
                aria-label="Close evaluation list"
                @click="selectedInterpretationIndex = null"
              />
            </div>
            <q-table
              flat
              bordered
              :rows="selectedEvaluations"
              :columns="evaluationColumns"
              :row-key="evaluationRowKey"
              :pagination="{ rowsPerPage: 5 }"
              no-data-label="No evaluations match this interpretation."
            >
              <template v-slot:body-cell-course_code="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    dense
                    no-caps
                    color="primary"
                    class="text-weight-bold text-underline"
                    :to="{ name: 'evaluationDetails', params: { id: props.row._id }, query: { tab: 'summary' } }"
                  >
                    {{ props.row.course_code }}
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </div>
        </aside>
        <div class="distribution-layout" :class="{ 'distribution-layout--drawer-open': selectedInterpretation }">
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
              v-for="(item, index) in interpretationSummary"
              :key="item.label"
              class="interpretation-row"
            >
              <div class="interpretation-row__heading">
                <q-btn
                  flat
                  dense
                  no-caps
                  class="interpretation-label"
                  :aria-pressed="selectedInterpretationIndex === index"
                  @click="toggleInterpretation(index)"
                >
                  <span class="interpretation-dot" :style="{ backgroundColor: item.color }"></span>
                  {{ item.label }}
                </q-btn>
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
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'

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

  props: {
    title: {
      type: String,
      default: 'Evaluation Rating Interpretation'
    },
    acadTerm: {
      type: Object,
      default: null
    },
    evaluation: {
      type: Array,
      default: null
    }
  },

  computed: {
    loading () {
      return !this.acadTerm || !Array.isArray(this.evaluation)
    },

    activeTermLabel () {
      if (!this.acadTerm) return 'Current evaluation term'

      const semesterLabels = { 21: '1st Semester', 22: '2nd Semester', 23: 'Summer' }
      const semester = semesterLabels[Number(this.acadTerm.sem)] || `Semester ${this.acadTerm.sem}`
      return `${this.acadTerm.acad_year} ${semester}`
    },

    evaluatedCount () {
      return this.classifiedEvaluations.length
    },

    classifiedEvaluations () {
      return (this.evaluation || [])
        .filter(evaluation => String(evaluation.status || 'DRAFT').toUpperCase() !== 'DRAFT')
        .map(evaluation => ({
          evaluation,
          interpretationIndex: this.getEvaluationInterpretation(evaluation)
        }))
        .filter(result => result.interpretationIndex !== null)
    },

    chartSeries () {
      const counts = INTERPRETATIONS.map((item, index) =>
        this.classifiedEvaluations.filter(result => result.interpretationIndex === index).length
      )
      return [{ name: 'Evaluations', data: counts }]
    },

    selectedInterpretation () {
      return Number.isInteger(this.selectedInterpretationIndex)
        ? INTERPRETATIONS[this.selectedInterpretationIndex]
        : null
    },

    selectedEvaluations () {
      if (!this.selectedInterpretation) return []

      return this.classifiedEvaluations
        .filter(result => result.interpretationIndex === this.selectedInterpretationIndex)
        .map(result => result.evaluation)
    },

    interpretationSummary () {
      const counts = this.chartSeries[0].data
      return INTERPRETATIONS.map((item, index) => {
        const count = counts[index]
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

  data () {
    return {
      selectedInterpretationIndex: null,
      evaluationColumns: [
        { name: 'course_code', label: 'Course Code', field: 'course_code', align: 'left', sortable: true },
        { name: 'dept_code', label: 'Department', field: 'dept_code', align: 'left', sortable: true },
        { name: 'college_code', label: 'College', field: 'college_code', align: 'left', sortable: true }
      ],
      chartOptions: {
        chart: {
          type: 'donut',
          toolbar: { show: false },
          animations: { enabled: true },
          events: {
            dataPointSelection: (event, chartContext, config) => {
              this.toggleInterpretation(config.dataPointIndex)
            }
          }
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
            },
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

  methods: {
    toggleInterpretation (index) {
      this.selectedInterpretationIndex = this.selectedInterpretationIndex === index
        ? null
        : index
    },

    evaluationRowKey (evaluation) {
      return evaluation._id || evaluation.id || evaluation.evaluation_id || evaluation.course_code
    },

    getEvaluationInterpretation (evaluation) {
      const details = evaluation.interpretationDetails
      const statistics = evaluation.responseStatistics || []
      const indicators = this.normalizeIndicators(details)

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
  overflow: hidden;
}

.interpretation-content {
  display: flex;
  min-width: 0;
}

.evaluation-drawer {
  flex: 0 0 0;
  min-width: 0;
  overflow: hidden;
  transition: flex-basis 280ms ease, margin-right 280ms ease;
}

.evaluation-drawer--open {
  flex-basis: 48%;
  margin-right: 20px;
}

.evaluation-drawer__content {
  width: 100%;
  min-width: 0;
  opacity: 0;
  transition: opacity 180ms ease;
}

.evaluation-drawer--open .evaluation-drawer__content {
  opacity: 1;
  transition-delay: 100ms;
}

.distribution-layout {
  flex: 1 1 auto;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(220px, 1fr);
  align-items: center;
  gap: 20px;
  transition: flex-basis 280ms ease;
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
  padding: 0;
  min-height: 28px;
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
  .chart-container--drawer-open .interpretation-content {
    flex-direction: column-reverse;
  }

  .evaluation-drawer--open {
    flex-basis: 300px;
    margin: 16px 0 0;
    overflow: visible;
  }

  .evaluation-drawer__content {
    min-width: 0;
  }

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
