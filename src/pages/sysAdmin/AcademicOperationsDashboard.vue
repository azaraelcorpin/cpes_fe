<template>
  <q-page padding class="operations-dashboard">
    <header class="dashboard-header">
      <div>
        <div class="text-overline text-primary text-weight-bold">Academic Operations</div>
        <h1 class="text-h4 text-weight-bold q-my-xs">Control Room</h1>
        <p class="text-body2 text-grey-7 q-mb-none">
          Monitor evaluation participation, workflow health, and academic quality indicators.
        </p>
      </div>
      <q-badge color="positive" rounded class="q-px-sm q-py-xs">
        Current term
      </q-badge>
    </header>

    <q-banner v-if="evaluationLoadError" dense rounded class="bg-red-1 text-negative q-mb-md">
      {{ evaluationLoadError }}
    </q-banner>

    <div class="dashboard-grid">
      <section class="dashboard-grid__interpretation">
        <EvaluationInterpretationBreakdown
          v-if="!evaluationLoadError"
          title="Course Evaluation Rating Interpretation"
          :acad-term="activeTerm"
          :evaluation="evaluations"
        />
      </section>
      <section class="dashboard-grid__workflow">
        <WorkflowJamTracker />
      </section>
      <section class="dashboard-grid__intervention">
        <ActiveInterventionRate />
      </section>
      <section class="dashboard-grid__participation">
        <ParticipationHeatmap />
      </section>
      <section class="dashboard-grid__deficits">
        <IndicatorDeficitBreakdown />
      </section>
    </div>
  </q-page>
</template>

<script>
import api from 'src/API/api.js'
import ActiveInterventionRate from 'src/components/ActiveInterventionRate.vue'
import EvaluationInterpretationBreakdown from 'src/components/EvaluationInterpretationBreakdown.vue'
import IndicatorDeficitBreakdown from 'src/components/IndicatorDeficitBreakdown.vue'
import ParticipationHeatmap from 'src/components/ParticipationHeatmap.vue'
import WorkflowJamTracker from 'src/components/WorkflowJamTracker.vue'

export default {
  name: 'AcademicOperationsDashboard',

  data () {
    return {
      activeTerm: null,
      evaluations: null,
      evaluationLoadError: ''
    }
  },

  components: {
    ActiveInterventionRate,
    EvaluationInterpretationBreakdown,
    IndicatorDeficitBreakdown,
    ParticipationHeatmap,
    WorkflowJamTracker
  },

  mounted () {
    this.loadEvaluationInterpretationData()
  },

  methods: {
    async loadEvaluationInterpretationData () {
      this.evaluationLoadError = ''

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
        this.activeTerm = activeTerm

        const evaluationsResponse = await api.getEvaluations({
          acad_year: activeTerm.acad_year,
          sem: Number(activeTerm.sem)
        })
        if (!evaluationsResponse || evaluationsResponse.error || !evaluationsResponse.success) {
          throw new Error('Unable to load evaluations for the active term.')
        }

        const evaluations = (Array.isArray(evaluationsResponse.data) ? evaluationsResponse.data : [])
          .filter(evaluation => String(evaluation.status || 'DRAFT').toUpperCase() !== 'DRAFT')
        this.evaluations = await this.mapWithConcurrency(
          evaluations,
          4,
          evaluation => this.getEvaluationData(evaluation)
        )
      } catch (error) {
        console.error('Failed to load evaluation interpretation data', error)
        this.evaluationLoadError = error.message || 'Unable to load evaluation interpretation data.'
      }
    },

    async getEvaluationData (evaluation) {
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
      const statistics = Array.isArray(statsResponse.data) ? statsResponse.data : []

      return {
        ...evaluation,
        interpretationDetails: details,
        responseStatistics: statistics
      }
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
    }
  }
}
</script>

<style scoped>
.operations-dashboard {
  min-width: 0;
  background: #f5f6f8;
}

.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.dashboard-header h1 {
  color: #202124;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
}

.dashboard-grid > section {
  min-width: 0;
}

.dashboard-grid__intervention {
  grid-column: span 6;
}

.dashboard-grid__participation {
  grid-column: span 8;
}

.dashboard-grid__workflow,
.dashboard-grid__deficits {
  grid-column: span 6;
}

.dashboard-grid__interpretation {
  grid-column: span 12;
}

@media (max-width: 1023px) {
  .dashboard-grid__intervention,
  .dashboard-grid__participation,
  .dashboard-grid__workflow,
  .dashboard-grid__deficits {
    grid-column: span 6;
  }
}

@media (max-width: 599px) {
  .dashboard-header {
    align-items: flex-start;
  }

  .dashboard-header h1 {
    font-size: 1.75rem;
  }

  .dashboard-grid__intervention,
  .dashboard-grid__participation,
  .dashboard-grid__workflow,
  .dashboard-grid__deficits {
    grid-column: 1 / -1;
  }
}
</style>
