<template>
  <q-card flat bordered class="dashboard-card">
    <q-card-section>
      <div class="text-subtitle1 text-weight-bold">{{ title }}</div>
      <div class="text-caption text-grey-7">Action-report approvals by workflow status</div>
    </q-card-section>

    <q-card-section class="chart-container">
      <div v-if="loading" class="loading-state">
        <q-spinner color="primary" size="32px" />
      </div>
      <template v-else>
        <div class="approval-track" aria-label="Action report approval status counts">
          <button
            type="button"
            v-for="(step, index) in approvalSteps"
            :key="step.status"
            class="approval-step"
            :class="{
              'approval-step--last': index === approvalSteps.length - 1,
              'approval-step--selected': selectedStatus === step.status
            }"
            :aria-pressed="selectedStatus === step.status"
            :aria-label="`${step.label}: ${step.count} evaluations. Show breakdown by college`"
            @click="toggleStatus(step.status)"
          >
            <div class="approval-step__node-wrap">
              <div class="approval-step__node" :class="`approval-step__node--${step.tone}`">
                {{ step.count }}
              </div>
              <div
                v-if="index < approvalSteps.length - 1"
                class="approval-step__connector"
                :class="{ 'approval-step__connector--complete': step.count > 0 }"
                aria-hidden="true"
              ></div>
            </div>
            <div class="approval-step__label">{{ step.label }}</div>
          </button>
        </div>

        <section v-if="selectedStatus" class="college-breakdown" aria-live="polite">
          <div class="college-breakdown__header">
            <div class="text-subtitle2 text-weight-bold">{{ selectedStatusLabel }} by college</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              aria-label="Close college breakdown"
              @click="selectedStatus = null"
            />
          </div>
          <div v-if="!selectedEvaluations.length" class="text-caption text-grey-7 q-pa-md">
            No evaluations have this workflow status.
          </div>
          <apexchart
            v-else
            type="pie"
            height="260"
            :options="collegeChartOptions"
            :series="collegeCounts.map(item => item.count)"
          />
        </section>
      </template>
    </q-card-section>
  </q-card>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'

const APPROVAL_STEPS = [
  { status: 'DRAFT', label: 'DRAFT', tone: 'muted' },
  { status: 'SUBMITTED', label: 'SUBMITTED', tone: 'primary' },
  { status: 'REVIEWED', label: 'REVIEWED', tone: 'info' },
  { status: 'ENDORSED', label: 'ENDORSED', tone: 'purple' },
  { status: 'CHECKED', label: 'CHECKED', tone: 'teal' },
  { status: 'APPROVED', label: 'APPROVED', tone: 'positive' }
]

export default {
  name: 'WorkflowJamTracker',

  components: {
    apexchart: VueApexCharts
  },

  props: {
    evaluation: {
      type: Object,
      default: null
    },
    title: {
      type: String,
      default: 'Workflow Jam Tracker'
    }
  },

  computed: {
    loading () {
      return !Array.isArray(this.evaluation?.data)
    },

    statusCounts () {
      return (this.evaluation?.data || []).reduce((counts, evaluation) => {
        const status = String(
          evaluation.action_report_status ||
          evaluation.actionReportStatus ||
          evaluation.action_report?.status ||
          'DRAFT'
        ).trim().toUpperCase()
        counts[status] = (counts[status] || 0) + 1
        return counts
      }, {})
    },

    selectedStatusLabel () {
      return APPROVAL_STEPS.find(step => step.status === this.selectedStatus)?.label || ''
    },

    selectedEvaluations () {
      if (!this.selectedStatus) return []

      return (this.evaluation?.data || []).filter((evaluation) => {
        const status = String(
          evaluation.action_report_status ||
          evaluation.actionReportStatus ||
          evaluation.action_report?.status ||
          'DRAFT'
        ).trim().toUpperCase()
        return status === this.selectedStatus
      })
    },

    collegeCounts () {
      const counts = this.selectedEvaluations.reduce((result, evaluation) => {
        const college = String(evaluation.college_code || '').trim() || 'Unassigned'
        result[college] = (result[college] || 0) + 1
        return result
      }, {})

      return Object.entries(counts)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([college, count]) => ({ college, count }))
    },

    collegeChartOptions () {
      return {
        chart: {
          type: 'donut',
          toolbar: { show: false }
        },
        labels: this.collegeCounts.map(item => `${item.college} (${item.count})`),
        colors: ['#1976d2', '#18864b', '#e6a23c', '#7553a6', '#168aad', '#c83e4d', '#667085', '#9ac8ab', '#eaf2ff', '#f0f5ff', '#f5f7fa', '#d9dee7', '#e4e7ec', '#f0f1f5', '#f9fafb'],
        legend: {
          position: 'right'
        },
        dataLabels: {
          enabled: true
        },
        tooltip: {
          y: {
            formatter: value => `${value} evaluation${value === 1 ? '' : 's'}`
          }
        },
        responsive: [{
          breakpoint: 600,
          options: {
            chart: { height: 300 },
            legend: { position: 'bottom' }
          }
        }]
      }
    },

    approvalSteps () {
      return APPROVAL_STEPS.map(step => ({
        ...step,
        count: this.statusCounts[step.status] || 0
      }))
    }
  },

  data () {
    return {
      selectedStatus: null
    }
  },

  methods: {
    toggleStatus (status) {
      this.selectedStatus = this.selectedStatus === status ? null : status
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
  padding-top: 20px;
  padding-bottom: 24px;
}

.approval-track {
  display: flex;
  align-items: flex-start;
  overflow-x: auto;
  padding: 4px 4px 14px;
}

.approval-step {
  flex: 1 0 96px;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: center;
  cursor: pointer;
  font: inherit;
}

.approval-step:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 3px;
  border-radius: 8px;
}

.approval-step--selected .approval-step__node {
  background: #eaf2ff;
  box-shadow: 0 0 0 4px rgb(25 118 210 / 16%);
}

.approval-step__node-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.approval-step__node {
  z-index: 1;
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 3px solid currentColor;
  border-radius: 50%;
  background: #ffffff;
  font-size: 19px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgb(16 24 40 / 8%);
}

.approval-step__node--muted {
  color: #667085;
}

.approval-step__node--primary {
  color: #1976d2;
}

.approval-step__node--info {
  color: #168aad;
}

.approval-step__node--purple {
  color: #7553a6;
}

.approval-step__node--teal {
  color: #128c83;
}

.approval-step__node--positive {
  color: #18864b;
}

.approval-step__connector {
  position: absolute;
  top: 28px;
  left: calc(50% + 29px);
  width: calc(100% - 58px);
  height: 3px;
  background: #d9dee7;
}

.approval-step__connector--complete {
  background: #9ac8ab;
}

.approval-step__label {
  color: #475467;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.035em;
  line-height: 1.3;
  white-space: nowrap;
}

.college-breakdown {
  margin: 18px 4px 0;
  padding: 12px;
  border: 1px solid #e4e7ec;
  border-radius: 10px;
  background: #ffffff;
}

.college-breakdown__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.loading-state {
  display: grid;
  min-height: 300px;
  place-items: center;
}

@media (max-width: 599px) {
  .approval-step {
    flex-basis: 88px;
  }

  .approval-step__node {
    width: 52px;
    height: 52px;
    font-size: 17px;
  }

  .approval-step__connector {
    top: 25px;
    left: calc(50% + 26px);
    width: calc(100% - 52px);
  }
}
</style>
