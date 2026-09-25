<template>
  <q-page class="student-submitted-page q-pa-md q-pa-lg-xl">
    <div class="submitted-container">
      <q-card v-if="loading" flat bordered class="q-pa-lg text-center text-grey-6">
        Loading submitted evaluation details...
      </q-card>

      <template v-else-if="submittedEvaluation">
        <q-card flat bordered class="submitted-header q-mb-md">
          <q-card-section>
            <div class="row items-start q-col-gutter-md">
              <div class="col">
                <div class="text-overline text-primary text-weight-bold">Submitted evaluation</div>
                <h1 class="text-h5 text-weight-bold q-my-xs text-grey-9">
                  {{ submittedEvaluation.course_title || 'Course evaluation' }}
                </h1>
                <div class="text-body2 text-grey-7">
                  {{ submittedEvaluation.course_code || 'Course code unavailable' }}
                </div>
              </div>
              <div class="col-auto text-right text-caption text-grey-6">
                <div>{{ submittedEvaluation.acad_year || 'Academic year unavailable' }}</div>
                <div>{{ formatSemester(submittedEvaluation.sem) }}</div>
                <div class="q-mt-xs text-primary text-weight-bold">
                  Submitted {{ formatDate(submittedEvaluation.submitted_at || submittedEvaluation.submittedAt) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md">
          <q-card-section class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-6">Student</div>
              <div class="text-subtitle2 text-weight-medium text-grey-9">
                {{ respondentName }}
              </div>
              <div class="text-body2 text-grey-7">{{ studentEmail }}</div>
            </div>
            <div class="col-12 col-md-3"></div>
            <div class="col-12 col-md-3">
              <div class="text-caption text-grey-6">Total answered</div>
              <div class="text-subtitle2 text-weight-medium text-grey-9">
                {{ totalAnswered }} / {{ totalItems }} items
              </div>
            </div>
            <!-- <div class="col-12 col-md-3">
              <div class="text-caption text-grey-6">Average rating</div>
              <div class="text-subtitle2 text-weight-medium text-grey-9">
                {{ averageRatingLabel }}
              </div>
            </div> -->
          </q-card-section>
        </q-card>

        <div v-for="indicator in indicators" :key="indicator.indicator_id || indicator._id" class="indicator-block q-mb-lg">
          <div class="indicator-header row items-center q-mb-md">
            <q-avatar color="primary" text-color="white" size="34px">
              {{ indicator.sort_order || 1 }}
            </q-avatar>
            <div class="q-ml-sm">
              <div class="text-subtitle1 text-weight-bold text-grey-9">
                {{ indicator.indicator_name || indicator.name || 'Indicator' }}
              </div>
            </div>
          </div>

          <q-list bordered separator class="bg-white rounded-borders">
            <q-item v-for="item in indicator.evaluation_items || []" :key="item.item_id || item._id || item.id" class="q-py-sm">
              <q-item-section>
                <q-item-label class="text-body2 text-weight-medium text-grey-9">
                  {{ item.item_name || item.name || 'Item' }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="ratingColor(item.given_rating || item.givenRating)" text-color="white" class="q-px-sm">
                  {{ ratingLabel(item.given_rating || item.givenRating) }}
                </q-badge>
              </q-item-section>
            </q-item>

            <q-item v-if="!(indicator.evaluation_items && indicator.evaluation_items.length)">
              <q-item-section class="text-grey-6 text-caption">
                No submitted answers were found for this indicator.
              </q-item-section>
            </q-item>
          </q-list>

          <q-card v-if="hasIndicatorComment(indicator)" flat bordered class="comment-panel q-mt-md">
            <q-card-section>
              <div class="text-subtitle2 text-weight-medium text-grey-8 q-mb-sm">Comments</div>
              <div class="text-body2 text-grey-8 comment-text">
                {{ getIndicatorComment(indicator) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <q-card v-else flat bordered class="q-pa-lg text-center text-grey-6">
        No submitted evaluation details were found.
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { useCookies } from 'vue3-cookies'
import api from 'src/API/api.js'
import myDialog from 'src/plugins/myDialog.js'

const sampleSubmittedEvaluation = {
  _id: 'sample-eval-001',
  course_code: 'ABM163',
  course_title: 'Intro to Agricultural Marketing Management',
  acad_year: '2026-2027',
  sem: 21,
  submitted_at: new Date().toISOString(),
  indicators: [
    {
      indicator_id: 10,
      indicator_name: 'Course Outcome Achievement',
      sort_order: 1,
      assigned_role: 'COORDINATOR',
      evaluation_items: [
        { item_id: 8, item_name: 'CO1: Explain key concepts and principles.', given_rating: 4 },
        { item_id: 9, item_name: 'CO2: Apply theories in practical contexts.', given_rating: 3 }
      ]
    },
    {
      indicator_id: 11,
      indicator_name: 'Course Quality',
      sort_order: 2,
      assigned_role: 'VCAA',
      evaluation_items: [
        { item_id: 10, item_name: 'The Course is essential and related to the discipline.', given_rating: 5 },
        { item_id: 11, item_name: 'The course content is relevant, appropriate and up-to-date.', given_rating: 4 }
      ]
    }
  ]
}

export default {
  name: 'StudentSubmittedEvaluation',

  data () {
    const { cookies } = useCookies()

    return {
      cookies,
      loading: false,
      student: {},
      submittedEvaluation: null
    }
  },

  computed: {
    respondentName () {
      const student = this.student || {}
      return student.fullname || [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || 'Student'
    },

    studentEmail () {
      return this.student.email || 'No email available'
    },

    indicators () {
      return this.submittedEvaluation?.indicators || []
    },

    totalItems () {
      return this.indicators.reduce((total, indicator) => total + (indicator.evaluation_items || []).length, 0)
    },

    totalAnswered () {
      return this.indicators.reduce((total, indicator) => {
        return total + (indicator.evaluation_items || []).filter(item => item.given_rating !== undefined && item.given_rating !== null).length
      }, 0)
    },

    averageRatingLabel () {
      const allRatings = this.indicators.flatMap(indicator => (indicator.evaluation_items || []).map(item => Number(item.given_rating || item.givenRating || 0)))
      if (!allRatings.length) return '—'

      const average = allRatings.reduce((sum, value) => sum + value, 0) / allRatings.length
      return `${average.toFixed(1)} / 5`
    }
  },

  mounted () {
    this.loadStudentProfile()
    this.loadSubmittedEvaluation()
  },

  methods: {
    safeParse (value) {
      if (!value) return null

      try {
        return typeof value === 'string' ? JSON.parse(value) : value
      } catch (error) {
        console.warn('Failed to parse cookie payload', error)
        return null
      }
    },

    loadStudentProfile () {
      const rawUser = this.cookies?.get?.('_UID_')
      const parsedUser = this.safeParse(rawUser)
      this.student = parsedUser || {}
    },

    async loadSubmittedEvaluation () {
      this.loading = true

      const evaluationId = this.$route.params.id || this.$route.query.evaluation_id || this.$route.params.course_code

      try {
        if (!evaluationId) {
          this.submittedEvaluation = this.normalizeSubmittedEvaluation(sampleSubmittedEvaluation)
          return
        }

        const response = await api.getResponseWithItems(evaluationId)
        const payload = response?.data || response
        this.submittedEvaluation = this.normalizeSubmittedEvaluation(payload)

        if (!this.submittedEvaluation) {
          this.submittedEvaluation = this.normalizeSubmittedEvaluation(sampleSubmittedEvaluation)
        }
      } catch (error) {
        console.error('Failed to load submitted evaluation', error)
        myDialog.negative(this.$q, 'Failed to load submitted evaluation', 'An error occurred while fetching the submitted evaluation details.')
        this.submittedEvaluation = null
      } finally {
        this.loading = false
      }
    },

    normalizeSubmittedEvaluation (data) {
      if (!data) return null

      const evaluation = data?.data && data?.success !== undefined ? data.data : data

      const indicators = Array.isArray(evaluation?.indicators)
        ? evaluation.indicators.map((indicator, index) => ({
            ...indicator,
            indicator_id: indicator.indicator_id || indicator._id || index + 1,
            indicator_name: indicator.indicator_name || indicator.name || 'Indicator',
            sort_order: indicator.sort_order || index + 1,
            assigned_role: indicator.assigned_role || 'N/A',
            evaluation_items: Array.isArray(indicator.evaluation_items || indicator.items)
              ? (indicator.evaluation_items || indicator.items).map((item, itemIndex) => ({
                  ...item,
                  item_id: item.item_id || item._id || item.id || itemIndex + 1,
                  item_name: item.item_name || item.name || 'Item',
                  given_rating: item.given_rating ?? item.givenRating ?? item.rating ?? null
                }))
              : []
          }))
        : []

      return {
        ...evaluation,
        indicators,
        ratingScaleItems: Array.isArray(evaluation?.ratingScaleItems) ? evaluation.ratingScaleItems : []
      }
    },

    formatSemester (value) {
      if (value === 21 || value === '21') return '1st Semester'
      if (value === 22 || value === '22') return '2nd Semester'
      if (value === 23 || value === '23') return 'Summer'
      return 'Semester unavailable'
    },

    formatDate (value) {
      if (!value) return 'Not available'

      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return value

      return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    ratingLabel (value) {
      const ratingValue = Number(value)
      if (!Number.isFinite(ratingValue)) return 'No answer'

      const scales = Array.isArray(this.submittedEvaluation?.ratingScaleItems)
        ? this.submittedEvaluation.ratingScaleItems
        : []

      const byFixedValue = scales.find((entry) => Number(entry.fixed_value) === ratingValue)
      if (byFixedValue?.description) {
        return byFixedValue.description
      }

      const ratingMap = {
        4: 'Strongly Agree',
        3: 'Agree',
        2: 'Disagree',
        1: 'Strongly Disagree',
        0: 'No answer'
      }

      return ratingMap[ratingValue] || 'No answer'
    },

    ratingColor (value) {
      const rating = Number(value)
      if (rating >= 4) return 'positive'
      if (rating === 3) return 'warning'
      if (rating === 2 || rating === 1) return 'negative'
      return 'grey'
    },

    hasIndicatorComment (indicator) {
      return indicator.comments && indicator.comments.length > 0
    },

    getIndicatorComment (indicator) {
      return indicator.comments && indicator.comments.length > 0
        ? indicator.comments.map(comment => comment.comment || comment.text || '').join('\n\n')
        : 'No comments provided.' 
    }
  }
}
</script>

<style scoped>
.student-submitted-page {
  min-height: 100%;
  background: #f5f7fb;
}

.submitted-container {
  width: min(100%, 960px);
  margin: 0 auto;
}

.submitted-header {
  border-radius: 10px;
  box-shadow: 0 4px 18px rgba(37, 55, 80, 0.08);
}

.indicator-block {
  background: transparent;
}

.indicator-header {
  padding-bottom: 10px;
  border-bottom: 1px solid #dfe5ee;
}

.comment-panel {
  border-left: 4px solid #ffb300;
  background: #fffaf0;
  border-radius: 10px;
}

.comment-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

.rounded-borders {
  border-radius: 10px;
}
</style>
