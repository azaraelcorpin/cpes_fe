<template>
  <q-page padding class="student-page">
    <q-card flat bordered class="page-header-card shadow-1">
      <q-card-section class="row items-center justify-between q-col-gutter-md">
        <div class="col-12 col-md-8">
          <div class="text-overline text-primary text-weight-bold header-kicker">Student profile</div>
          <div class="row items-center q-col-gutter-md no-wrap">
            <div class="avatar-badge">{{ initials }}</div>
            <div>
              <div class="text-h5 text-weight-bold text-grey-9">{{ studentDisplayName }}</div>
              <div class="text-body2 text-grey-7">Student ID: {{ studentIdentifier }} &nbsp;•&nbsp; {{ studentProgram }}</div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Academic year</div>
              <div class="summary-value">{{ academicYearLabel }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Semester</div>
              <div class="summary-value">{{ semesterLabel }}</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="courses-shell">
      <q-card-section class="row items-center justify-between q-col-gutter-md actions-bar">
        <div>
          <div class="text-subtitle1 text-weight-bold text-grey-9">Enrolled courses</div>
          <div class="text-caption text-grey-6">{{ courses.length }} total subjects</div>
        </div>

        <q-btn-toggle
          v-if="!isMobile"
          v-model="currentView"
          unelevated
          no-caps
          toggle-color="primary"
          color="grey-2"
          text-color="grey-7"
          class="view-toggle"
          :options="[
            { label: 'Table', value: 'table' },
            { label: 'Cards', value: 'card' }
          ]"
        />
      </q-card-section>

      <q-separator />

      <q-card-section v-if="currentView === 'table' && !isMobile" class="table-section">
        <q-table
          :rows="courses"
          :columns="columns"
          row-key="subjectCode"
          flat
          bordered
          class="enrolled-table"
          :pagination="{ rowsPerPage: 8 }"
        >
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge
                rounded
                :color="props.row.status === 'Evaluated' ? 'positive' : 'grey-5'"
                text-color="white"
                class="q-px-sm q-py-xs text-weight-bold"
              >
                {{ props.row.status }}
              </q-badge>
              <q-badge v-if="props.row.formStatus !== 'ACTIVE'"
                rounded
                :color="'grey-5'"
                text-color="white"
                class="q-px-sm q-py-xs text-weight-bold"
              >
                {{ props.row.formStatus }} FORM
              </q-badge>              
            </q-td>
          </template>

          <template #body-cell-action="props">
            <q-td :props="props">
              <q-btn
                dense
                :disable="props.row.formStatus !== 'ACTIVE'"
                :unelevated="props.row.status !== 'Evaluated'"
                :outline="props.row.status === 'Evaluated'"
                :color="props.row.status === 'Evaluated' ? 'secondary' : 'primary'"
                no-caps
                :to="props.row.status === 'Evaluated'
                  ? { name: 'studentSubmittedEvaluation', params: { id: props.row.evaluationId } }
                  : { name: 'studentCourseEvaluation', params: { course_code: props.row.subjectCode } }"
              >
                {{ props.row.status === 'Evaluated' ? 'View submission' : 'Evaluate' }}
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-card-section v-else class="card-section bg-grey-1">
        <div class="row q-col-gutter-md">
          <div v-for="course in courses" :key="course.subjectCode" class="col-12 col-md-6 col-xl-4">
            <q-card flat bordered class="course-card full-height">
              <q-card-section class="row items-start justify-between q-pb-sm">
                <div>
                  <div class="text-overline text-grey-6">{{ course.subjectCode }}</div>
                  <div class="text-subtitle1 text-weight-bold text-grey-9">{{ course.subjectName }}</div>
                </div>
                <div class="column items-end q-gutter-xs">
                  <q-badge
                    rounded
                    :color="course.status === 'Evaluated' ? 'positive' : 'grey-5'"
                    text-color="white"
                    class="q-px-sm q-py-xs text-weight-bold"
                  >
                    {{ course.status }}
                  </q-badge>

                  <q-badge
                    v-if="course.formStatus !== 'ACTIVE'"
                    rounded
                    :color="'grey-5'"
                    text-color="white"
                    class="q-px-sm q-py-xs text-weight-bold"
                  >
                    {{ course.formStatus }} FORM
                  </q-badge>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section class="text-caption text-grey-7">
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <div class="section-label">Section</div>
                    <div>{{ course.section }}</div>
                  </div>
                  <div class="col-6">
                    <div class="section-label">Faculty</div>
                    <div>{{ course.facultyName }}</div>
                  </div>
                </div>

                <div v-if="course.schedule && course.schedule.length" class="q-mt-sm">
                  <div class="section-label">Schedule</div>
                  <div v-for="(entry, index) in getScheduleEntries(course)" :key="`${course.subjectCode}-schedule-${index}`" class="schedule-item">
                    {{ entry }}
                  </div>
                </div>

                <div v-else class="q-mt-sm">
                  <div class="section-label">Schedule</div>
                  <div>Schedule unavailable</div>
                </div>
              </q-card-section>

              <q-card-actions align="right" class="q-px-md q-pb-md">
                <q-btn
                  :disable="course.formStatus !== 'ACTIVE'"
                  :to="course.status === 'Evaluated'
                    ? { name: 'studentSubmittedEvaluation', params: { id: course.evaluationId } }
                    : { name: 'studentCourseEvaluation', params: { course_code: course.subjectCode } }"
                  :outline="course.status === 'Evaluated'"
                  :unelevated="course.status !== 'Evaluated'"
                  dense
                  :color="course.status === 'Evaluated' ? 'secondary' : 'primary'"
                  no-caps
                  @click="evaluateCourse(course)"
                >
                  {{ course.status === 'Evaluated' ? 'View submission' : 'Evaluate' }}
                </q-btn>
              </q-card-actions>
              </q-card>
            </div>
          </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { useCookies } from 'vue3-cookies'
import api from 'src/API/api.js'

export default {
  name: 'StudentEnrolledCourses',

  data () {
    const { cookies } = useCookies()

    return {
      cookies,
      currentView: 'table',
      columns: [
        { name: 'subjectCode', label: 'Subject Code', field: 'subjectCode', align: 'left', sortable: true },
        { name: 'subjectName', label: 'Subject Name', field: 'subjectName', align: 'left', sortable: true },
        { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
        { name: 'action', label: 'Action', field: 'action', align: 'right' }
      ],
      student: {},
      courses: []
    }
  },

  computed: {
    isMobile () {
      return this.$q?.screen?.lt?.md || false
    },

    studentDisplayName () {
      return this.student.fullname || [this.student.firstName, this.student.middleName, this.student.lastName].filter(Boolean).join(' ')
    },

    initials () {
      // const value = this.studentDisplayName || 'ST'
      // return value
      //   .split(' ')
      //   .filter(Boolean)
      //   .slice(0, 2)
      //   .map(part => part.charAt(0).toUpperCase())
      //   .join('') || 'ST'
      return this.student.firstName && this.student.lastName
        ? `${this.student.firstName.charAt(0).toUpperCase()}${this.student.lastName.charAt(0).toUpperCase()}`
        : 'ST'
    },

    studentIdentifier () {
      return this.student.studentNumber || 'Student ID unavailable'
    },

    studentProgram () {
      return this.student.courseName || 'Program unavailable'
    },

    academicYearLabel () {
      return this.student.academicYear || 'Academic year unavailable'
    },

    semesterLabel () {
      const termCode = this.student.termCode

      if (termCode === 21 || termCode === '21') return '1st Semester'
      if (termCode === 22 || termCode === '22') return '2nd Semester'
      if (termCode === 23 || termCode === '23') return 'Summer'

      return 'Unknown semester'
    }
  },

  mounted () {
    this.loadStudentProfile()

    this.$watch(
      () => this.$q?.screen?.lt?.md,
      (isMobile) => {
        this.syncViewMode(isMobile)
      },
      { immediate: true }
    )

    this.fetchEnrolledCourses()
  },

  methods: {
    syncViewMode (isMobile = this.isMobile) {
      if (isMobile) {
        this.currentView = 'card'
        return
      }

      this.currentView = 'table'
    },
    loadStudentProfile () {
      const rawStudent = this.cookies?.get?.('_UID_')

      if (!rawStudent) {
        this.student = {}
        return
      }

      try {
        const parsedStudent = typeof rawStudent === 'string' ? JSON.parse(rawStudent) : rawStudent
        this.student = parsedStudent || {}
      } catch (error) {
        console.warn('Failed to parse student cookie data', error)
        this.student = {}
      }
    },

    getScheduleEntries (course) {
      const schedule = Array.isArray(course?.schedule) ? course.schedule : []

      if (!schedule.length) {
        return ['Schedule unavailable']
      }

      return schedule.map((slot) => {
        const days = Array.isArray(slot?.days)
          ? slot.days.join(', ')
          : (slot?.days || 'Schedule')

        const time = slot?.time || slot?.times || ''

        return time ? `${days} • ${time}` : days
      })
    },

    normalizeCourse (course) {
      const source = course?.course || course || {}
      const schedule = Array.isArray(source.schedule) ? source.schedule : []

      return {
        enrollmentId: source.enrollmentId || source.enrollment_id || null,
        evaluationId: source.evaluationId || source.evaluation_id || source.response_id || source._id || null,
        section: source.section || source.section_name || source.sectionName || 'N/A',
        subjectCode: source.subjectCode || source.course_code || source.subject_code || source.courseCode || 'N/A',
        subjectName: source.subjectName || source.course_title || source.subject_name || source.courseTitle || source.course_name || 'Untitled course',
        status: source.status || course?.status || 'Not Evaluated',
        facultyName: source.facultyName || source.faculty_name || source.instructor || 'TBA',
        units: source.units || source.unit || source.credit_units || 'TBA',
        formStatus: source.formStatus || source.form_status || 'ACTIVE',
        schedule
      }
    },

    async fetchEnrolledCourses () {
      const enrollmentId = this.student?.enrollmentid || this.$route.query.enrollment_id

      if (!enrollmentId) {
        this.courses = []
        return
      }

      try {
        const response = await api.getEnrolledCoursesByEnrollmentId(enrollmentId)
        const data = response?.data || response?.result || []

        if (!Array.isArray(data) || !data.length) {
          this.courses = []
          return
        }

        this.courses = data.map(item => this.normalizeCourse(item))
      } catch (error) {
        console.error('Failed to load enrolled courses', error)
        this.courses = []
      }
    },

    evaluateCourse (course) {
      const actionText = course.status === 'Evaluated' ? 'view submission' : 'start evaluation'

      this.$q.notify({
        type: 'info',
        message: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} for ${course.subjectCode}`,
        position: 'top-right'
      })
    }
  }
}
</script>

<style scoped>
.student-page {
  background: #f5f5f4;
}

.page-header-card {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
}

.header-kicker {
  letter-spacing: 0.2em;
  margin-bottom: 10px;
}

.avatar-badge {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: linear-gradient(135deg, #650b0e, #9a2d2f);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.15rem;
  box-shadow: 0 8px 20px rgba(101, 11, 14, 0.18);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-item {
  background: #f8f5f3;
  border: 1px solid #e8e0d7;
  border-radius: 12px;
  padding: 12px 14px;
}

.summary-label {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7a7068;
  margin-bottom: 4px;
}

.summary-value {
  font-weight: 700;
  font-size: 0.97rem;
  color: #202124;
}

.courses-shell {
  border-radius: 16px;
  overflow: hidden;
}

.actions-bar {
  padding-bottom: 12px;
}

.view-toggle {
  border-radius: 10px;
}

.table-section {
  padding: 0;
}

.enrolled-table :deep(th) {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #615d58;
  background: #f3f0ec;
}

.card-section {
  padding-top: 16px;
}

.course-card {
  border-radius: 14px;
  height: 100%;
}

.section-label {
  color: #7a7068;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.schedule-item {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .actions-bar {
    align-items: flex-start;
  }
}
</style>
