<template>
  <q-card flat bordered class="dashboard-card">
    <q-card-section class="row items-start justify-between q-pb-none">
      <div>
        <div class="text-subtitle1 text-weight-bold">Active Intervention Rate</div>
        <div class="text-caption text-grey-7">{{ activeTerm || 'Current term' }}</div>
      </div>
      <q-badge v-if="!loading && !error" :color="statusColor" rounded>{{ statusLabel }}</q-badge>
    </q-card-section>

    <q-card-section class="chart-container">
      <q-banner v-if="error" dense rounded class="bg-red-1 text-negative">{{ error }}</q-banner>
      <div v-else-if="loading" class="loading-state">
        <q-spinner color="primary" size="32px" />
      </div>
      <template v-else>
        <apexchart
          type="radialBar"
          height="250"
          :options="chartOptions"
          :series="chartSeries"
        />
        <p class="chart-caption">
          {{ coursesRequiringIntervention }} of {{ totalEvaluatedCourses }} evaluated courses
          ({{ interventionRate }}%) require intervention based on critical quality metrics.
        </p>
      </template>
    </q-card-section>
  </q-card>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'

export default {
  name: 'ActiveInterventionRate',

  components: {
    apexchart: VueApexCharts
  },

  data () {
    return {
      activeTerm: '',
      totalEvaluatedCourses: 0,
      coursesRequiringIntervention: 0,
      interventionRate: 0,
      warningThreshold: 10,
      loading: true,
      error: '',
      chartSeries: [],
      chartOptions: {
        chart: {
          type: 'radialBar',
          sparkline: { enabled: true },
          toolbar: { show: false }
        },
        colors: ['#e76f51'],
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 135,
            hollow: { size: '62%' },
            track: {
              background: '#fde8e3',
              strokeWidth: '100%'
            },
            dataLabels: {
              name: {
                show: true,
                offsetY: 28,
                color: '#667085',
                fontSize: '13px'
              },
              value: {
                show: true,
                offsetY: -10,
                color: '#202124',
                fontSize: '32px',
                fontWeight: 700,
                formatter: value => `${Number(value).toFixed(1)}%`
              }
            }
          }
        },
        labels: ['Intervention rate'],
        stroke: { lineCap: 'round' }
      }
    }
  },

  computed: {
    statusColor () {
      return this.interventionRate > this.warningThreshold ? 'negative' : 'positive'
    },

    statusLabel () {
      return this.interventionRate > this.warningThreshold ? 'Above target' : 'Within target'
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
        // Replace this local JSON import with the semester metrics HTTP endpoint.
        const response = await import('../data/dashboard/active-intervention-rate.json')
        const payload = response.default
        const rate = Number(payload.intervention_rate_percentage)

        if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
          throw new Error('The intervention rate payload must contain a percentage from 0 to 100.')
        }

        this.activeTerm = payload.active_term
        this.totalEvaluatedCourses = Number(payload.total_evaluated_courses) || 0
        this.coursesRequiringIntervention = Number(payload.courses_requiring_intervention) || 0
        this.interventionRate = rate
        this.chartSeries = [rate]
        this.chartOptions = {
          ...this.chartOptions,
          colors: [rate > this.warningThreshold ? '#e76f51' : '#2a9d8f'],
          plotOptions: {
            ...this.chartOptions.plotOptions,
            radialBar: {
              ...this.chartOptions.plotOptions.radialBar,
              track: {
                ...this.chartOptions.plotOptions.radialBar.track,
                background: rate > this.warningThreshold ? '#fde8e3' : '#e3f3ef'
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load active intervention rate data', error)
        this.error = 'Unable to load intervention rate data.'
      } finally {
        this.loading = false
      }
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

.loading-state {
  display: grid;
  min-height: 250px;
  place-items: center;
}

.chart-caption {
  margin: 0;
  color: #667085;
  font-size: 0.8rem;
  line-height: 1.45;
  text-align: center;
}
</style>
