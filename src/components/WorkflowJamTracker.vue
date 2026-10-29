<template>
  <q-card flat bordered class="dashboard-card">
    <q-card-section>
      <div class="text-subtitle1 text-weight-bold">Urgent Workflow Jam Tracker</div>
      <div class="text-caption text-grey-7">Action reports by clearance state</div>
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
  name: 'WorkflowJamTracker',

  components: {
    apexchart: VueApexCharts
  },

  data () {
    return {
      loading: true,
      error: '',
      chartSeries: [{ name: 'Action reports', data: [] }],
      chartOptions: {
        chart: {
          type: 'bar',
          toolbar: { show: false }
        },
        colors: ['#6c63a8'],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '48%',
            borderRadius: 4,
            dataLabels: { position: 'center' }
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: ['#ffffff'],
            fontSize: '12px',
            fontWeight: 700
          }
        },
        xaxis: {
          categories: [],
          labels: { style: { colors: '#667085' } }
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
          title: { text: 'Report count' },
          labels: { formatter: value => Math.round(value) }
        },
        grid: { borderColor: '#eaecf0' },
        tooltip: { y: { formatter: value => `${value} reports` } },
        legend: { show: false }
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
        // Replace this local JSON import with grouped course_eval.action_report status counts.
        const response = await import('../data/dashboard/workflow-jam-tracker.json')
        const payload = response.default

        if (!Array.isArray(payload)) {
          throw new Error('Workflow payload must be an array.')
        }

        this.chartOptions = {
          ...this.chartOptions,
          xaxis: {
            ...this.chartOptions.xaxis,
            categories: payload.map(report => report.status)
          }
        }
        this.chartSeries = [{
          name: 'Action reports',
          data: payload.map(report => Number(report.count) || 0)
        }]
      } catch (error) {
        console.error('Failed to load workflow data', error)
        this.error = 'Unable to load workflow status data.'
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
