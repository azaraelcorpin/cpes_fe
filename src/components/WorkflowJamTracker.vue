<template>
  <q-card flat bordered class="dashboard-card">
    <q-card-section>
      <div class="text-subtitle1 text-weight-bold">Urgent Workflow Jam Tracker</div>
      <div class="text-caption text-grey-7">Action-report approvals by workflow status</div>
    </q-card-section>

    <q-card-section class="chart-container">
      <q-banner v-if="error" dense rounded class="bg-red-1 text-negative">{{ error }}</q-banner>
      <div v-else-if="loading" class="loading-state">
        <q-spinner color="primary" size="32px" />
      </div>
      <template v-else>
        <div class="approval-track" aria-label="Action report approval status counts">
          <div
            v-for="(step, index) in approvalSteps"
            :key="step.status"
            class="approval-step"
            :class="{ 'approval-step--last': index === approvalSteps.length - 1 }"
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
          </div>
        </div>

        <div class="declined-summary">
          <q-icon name="reply" color="negative" size="18px" />
          <span class="text-weight-medium">Declined / returned</span>
          <q-badge color="negative" rounded>{{ declinedCount }}</q-badge>
          <span class="text-caption text-grey-7">sent back for revision</span>
        </div>
      </template>
    </q-card-section>
  </q-card>
</template>

<script>
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

  data () {
    return {
      loading: true,
      error: '',
      statusCounts: {}
    }
  },

  computed: {
    approvalSteps () {
      return APPROVAL_STEPS.map(step => ({
        ...step,
        count: this.statusCounts[step.status] || 0
      }))
    },

    declinedCount () {
      return this.statusCounts.DECLINED || 0
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
        // Replace this local JSON import with counts grouped by course_eval.action_report status.
        const response = await import('../data/dashboard/workflow-jam-tracker.json')
        const payload = response.default

        if (!Array.isArray(payload)) {
          throw new Error('Workflow payload must be an array.')
        }

        this.statusCounts = payload.reduce((counts, report) => {
          const status = String(report.status || '').trim().toUpperCase()
          if (status) counts[status] = Number(report.count) || 0
          return counts
        }, {})
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
  text-align: center;
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

.declined-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 8px auto 0;
  padding: 9px 14px;
  width: fit-content;
  max-width: 100%;
  border: 1px solid #f2c8cc;
  border-radius: 8px;
  background: #fff7f7;
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

  .declined-summary {
    flex-wrap: wrap;
  }
}
</style>
