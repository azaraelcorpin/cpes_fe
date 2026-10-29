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

    <div class="dashboard-grid">
      <section class="dashboard-grid__intervention">
        <ActiveInterventionRate />
      </section>
      <section class="dashboard-grid__participation">
        <ParticipationHeatmap />
      </section>
      <section class="dashboard-grid__workflow">
        <WorkflowJamTracker />
      </section>
      <section class="dashboard-grid__deficits">
        <IndicatorDeficitBreakdown />
      </section>
      <section class="dashboard-grid__interpretation">
        <EvaluationInterpretationBreakdown />
      </section>
    </div>
  </q-page>
</template>

<script>
import ActiveInterventionRate from 'src/components/ActiveInterventionRate.vue'
import EvaluationInterpretationBreakdown from 'src/components/EvaluationInterpretationBreakdown.vue'
import IndicatorDeficitBreakdown from 'src/components/IndicatorDeficitBreakdown.vue'
import ParticipationHeatmap from 'src/components/ParticipationHeatmap.vue'
import WorkflowJamTracker from 'src/components/WorkflowJamTracker.vue'

export default {
  name: 'AcademicOperationsDashboard',

  components: {
    ActiveInterventionRate,
    EvaluationInterpretationBreakdown,
    IndicatorDeficitBreakdown,
    ParticipationHeatmap,
    WorkflowJamTracker
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
  grid-column: span 4;
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
