<template>
  <q-card flat bordered class="dashboard-card">
    <q-card-section>
      <div class="text-subtitle1 text-weight-bold">Active Faculty Collaboration Status</div>
      <div class="text-caption text-grey-7">Committee consensus by department</div>
    </q-card-section>

    <q-card-section class="chart-container">
      <q-banner v-if="error" dense rounded class="bg-red-1 text-negative">{{ error }}</q-banner>
      <div v-else-if="loading" class="loading-state">
        <q-spinner color="primary" size="32px" />
      </div>
      <apexchart
        v-else
        type="bar"
        height="300"
        :options="chartOptions"
        :series="chartSeries"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'

export default {
  name: 'FacultyCollaborationStatus',

  components: {
    apexchart: VueApexCharts
  },

  data () {
    return {
      loading: true,
      error: '',
      chartSeries: [
        { name: 'AGREED', data: [] },
        { name: 'PENDING', data: [] }
      ],
      chartOptions: {
        chart: {
          type: 'bar',
          stacked: true,
          stackType: '100%',
          toolbar: { show: false }
        },
        colors: ['#2a9d8f', '#e9b44c'],
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: '54%'
          }
        },
        dataLabels: {
          enabled: true,
          formatter: value => `${Math.round(value)}%`,
          style: {
            colors: ['#ffffff'],
            fontSize: '11px',
            fontWeight: 700
          }
        },
        xaxis: {
          categories: [],
          max: 100,
          labels: {
            formatter: value => `${Math.round(value)}%`,
            style: { colors: '#667085' }
          }
        },
        yaxis: {
          labels: { style: { colors: '#475467' } }
        },
        grid: { borderColor: '#eaecf0' },
        legend: { position: 'top' },
        tooltip: {
          y: { formatter: value => `${value} faculty` }
        }
      }
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
        // Replace this local JSON import with course_eval.action_member department counts.
        const response = await import('../data/dashboard/faculty-collaboration-status.json')
        const payload = response.default

        if (!Array.isArray(payload)) {
          throw new Error('Faculty collaboration payload must be an array.')
        }

        this.chartOptions = {
          ...this.chartOptions,
          xaxis: {
            ...this.chartOptions.xaxis,
            categories: payload.map(department => department.dept_code)
          }
        }
        this.chartSeries = [
          {
            name: 'AGREED',
            data: payload.map(department => Number(department.agreed_count) || 0)
          },
          {
            name: 'PENDING',
            data: payload.map(department => Number(department.pending_count) || 0)
          }
        ]
      } catch (error) {
        console.error('Failed to load faculty collaboration data', error)
        this.error = 'Unable to load faculty collaboration data.'
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
  min-height: 300px;
  place-items: center;
}
</style>
