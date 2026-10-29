<template>
  <q-card flat bordered class="dashboard-card">
    <q-card-section>
      <div class="text-subtitle1 text-weight-bold">Evaluation Participation Tracker</div>
      <div class="text-caption text-grey-7">Student survey completion by college</div>
    </q-card-section>

    <q-banner v-if="error" dense rounded class="q-mx-md q-mb-md bg-red-1 text-negative">
      {{ error }}
    </q-banner>
    <div v-else-if="loading" class="loading-state">
      <q-spinner color="primary" size="32px" />
    </div>
    <template v-else>
      <q-separator />
      <q-list separator>
        <q-item v-for="(college, index) in colleges" :key="college.college_code">
          <q-item-section avatar>
            <q-badge color="grey-3" text-color="grey-8" rounded>{{ index + 1 }}</q-badge>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">{{ college.college_code }}</q-item-label>
            <q-item-label caption>
              {{ college.responses.toLocaleString() }} of
              {{ college.expected_enrollment.toLocaleString() }} responses
            </q-item-label>
            <q-linear-progress
              class="completion-progress"
              rounded
              size="8px"
              :value="college.percentage / 100"
              :color="progressColor(college.percentage)"
              track-color="grey-3"
            />
          </q-item-section>

          <q-item-section side class="text-weight-bold">
            {{ college.percentage }}%
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </q-card>
</template>

<script>
export default {
  name: 'ParticipationHeatmap',

  data () {
    return {
      colleges: [],
      loading: true,
      error: ''
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
        // Replace this local JSON import with the active-term cpes_setting.acad_terms endpoint.
        const response = await import('../data/dashboard/participation-heatmap.json')
        const payload = response.default

        if (!Array.isArray(payload)) {
          throw new Error('Participation payload must be an array.')
        }

        this.colleges = payload
          .map(college => ({
            ...college,
            percentage: Number(college.percentage) || 0
          }))
          .sort((first, second) => second.percentage - first.percentage)
      } catch (error) {
        console.error('Failed to load participation data', error)
        this.error = 'Unable to load participation data.'
      } finally {
        this.loading = false
      }
    },

    progressColor (percentage) {
      if (percentage < 30) return 'negative'
      if (percentage <= 60) return 'warning'
      return 'positive'
    }
  }
}
</script>

<style scoped>
.dashboard-card {
  height: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: 12px;
}

.completion-progress {
  margin-top: 8px;
}

.loading-state {
  display: grid;
  min-height: 180px;
  place-items: center;
}
</style>
