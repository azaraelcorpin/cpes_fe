<template>
  <q-card flat bordered class="dashboard-card">
    <q-card-section>
      <div class="text-subtitle1 text-weight-bold">Critical Indicator Deficit Breakdown</div>
      <div class="text-caption text-grey-7">Pareto view of reported quality deficits</div>
    </q-card-section>

    <q-card-section class="chart-container">
      <q-banner v-if="error" dense rounded class="bg-red-1 text-negative">{{ error }}</q-banner>
      <div v-else-if="loading" class="loading-state">
        <q-spinner color="primary" size="32px" />
      </div>
      <apexchart
        v-else
        type="line"
        height="340"
        :options="chartOptions"
        :series="chartSeries"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'

export default {
  name: 'IndicatorDeficitBreakdown',

  components: {
    apexchart: VueApexCharts
  },

  data () {
    return {
      loading: true,
      error: '',
      chartSeries: [
        { name: 'Deficit count', type: 'column', data: [] },
        { name: 'Cumulative percentage', type: 'line', data: [] }
      ],
      chartOptions: {
        chart: {
          type: 'line',
          toolbar: { show: false }
        },
        colors: ['#d97745', '#365f91'],
        stroke: {
          width: [0, 3],
          curve: 'straight'
        },
        plotOptions: {
          bar: {
            columnWidth: '52%',
            borderRadius: 3
          }
        },
        markers: { size: [0, 4] },
        dataLabels: { enabled: false },
        xaxis: {
          categories: [],
          labels: {
            rotate: -20,
            trim: true,
            style: { colors: '#667085', fontSize: '11px' }
          }
        },
        yaxis: [
          {
            seriesName: 'Deficit count',
            min: 0,
            title: { text: 'Deficit count' },
            labels: { formatter: value => Math.round(value) }
          },
          {
            seriesName: 'Cumulative percentage',
            opposite: true,
            min: 0,
            max: 100,
            title: { text: 'Cumulative percentage' },
            labels: { formatter: value => `${Math.round(value)}%` }
          }
        ],
        tooltip: {
          shared: true,
          y: [
            { formatter: value => `${value} deficits` },
            { formatter: value => `${value}% cumulative` }
          ]
        },
        grid: { borderColor: '#eaecf0' },
        legend: { position: 'top' }
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
        // Replace this local JSON import with cpes_setting.indicator deficit metrics.
        const response = await import('../data/dashboard/indicator-deficit-breakdown.json')
        const payload = response.default

        if (!Array.isArray(payload)) {
          throw new Error('Indicator deficit payload must be an array.')
        }

        const sortedIndicators = [...payload].sort(
          (first, second) => Number(second.deficit_count) - Number(first.deficit_count)
        )
        this.chartOptions = {
          ...this.chartOptions,
          xaxis: {
            ...this.chartOptions.xaxis,
            categories: sortedIndicators.map(indicator => indicator.indicator_name)
          }
        }
        this.chartSeries = [
          {
            name: 'Deficit count',
            type: 'column',
            data: sortedIndicators.map(indicator => Number(indicator.deficit_count) || 0)
          },
          {
            name: 'Cumulative percentage',
            type: 'line',
            data: sortedIndicators.map(indicator => Number(indicator.cumulative_percentage) || 0)
          }
        ]
      } catch (error) {
        console.error('Failed to load indicator deficit data', error)
        this.error = 'Unable to load indicator deficit data.'
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
  overflow: hidden;
}

.loading-state {
  display: grid;
  min-height: 340px;
  place-items: center;
}
</style>
