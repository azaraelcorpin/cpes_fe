<template>
  <q-page padding class="student-page">
    <q-card flat bordered class="page-header-card shadow-1">
      <q-card-section class="row items-center justify-between q-col-gutter-md">
        <div class="col-12 col-md-8">
          <div class="text-overline text-primary text-weight-bold header-kicker">Student profile</div>
          <div class="row items-center q-col-gutter-md no-wrap">
            <div class="avatar-badge">SA</div>
            <div>
              <div class="text-h5 text-weight-bold text-grey-9">Sarah A. Dela Cruz</div>
              <div class="text-body2 text-grey-7">Student ID: 2024-000123 &nbsp;•&nbsp; BS Computer Science</div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Academic year</div>
              <div class="summary-value">2025-2026</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Semester</div>
              <div class="summary-value">1st Semester</div>
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

      <q-card-section v-if="currentView === 'table'" class="table-section">
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
            </q-td>
          </template>

          <template #body-cell-action="props">
            <q-td :props="props">
              <q-btn
                dense
                :unelevated="props.row.status !== 'Evaluated'"
                :outline="props.row.status === 'Evaluated'"
                :color="props.row.status === 'Evaluated' ? 'secondary' : 'primary'"
                no-caps
                @click="evaluateCourse(props.row)"
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
                <q-badge
                  rounded
                  :color="course.status === 'Evaluated' ? 'positive' : 'grey-5'"
                  text-color="white"
                  class="q-px-sm q-py-xs text-weight-bold"
                >
                  {{ course.status }}
                </q-badge>
              </q-card-section>

              <q-separator />

              <q-card-section class="text-caption text-grey-7">
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <div class="section-label">Instructor</div>
                    <div>{{ course.instructor }}</div>
                  </div>
                  <div class="col-6">
                    <div class="section-label">Units</div>
                    <div>{{ course.units }}</div>
                  </div>
                </div>
              </q-card-section>

              <q-card-actions align="right" class="q-px-md q-pb-md">
                <q-btn
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
export default {
  name: 'StudentEnrolledCourses',

  data() {
    return {
      currentView: 'table',
      columns: [
        { name: 'subjectCode', label: 'Subject Code', field: 'subjectCode', align: 'left', sortable: true },
        { name: 'subjectName', label: 'Subject Name', field: 'subjectName', align: 'left', sortable: true },
        { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
        { name: 'action', label: 'Action', field: 'action', align: 'right' }
      ],
      courses: [
        {
          subjectCode: 'CS 101',
          subjectName: 'Introduction to Computing',
          status: 'Evaluated',
          instructor: 'Prof. L. Santos',
          units: '3 units'
        },
        {
          subjectCode: 'CS 102',
          subjectName: 'Programming Fundamentals',
          status: 'Not Evaluated',
          instructor: 'Prof. M. Flores',
          units: '4 units'
        },
        {
          subjectCode: 'MTH 101',
          subjectName: 'Calculus I',
          status: 'Not Evaluated',
          instructor: 'Dr. R. Bautista',
          units: '3 units'
        },
        {
          subjectCode: 'ENG 101',
          subjectName: 'English Communication',
          status: 'Evaluated',
          instructor: 'Ms. C. Valencia',
          units: '3 units'
        },
        {
          subjectCode: 'PSY 101',
          subjectName: 'General Psychology',
          status: 'Not Evaluated',
          instructor: 'Dr. A. Gomez',
          units: '3 units'
        },
        {
          subjectCode: 'PHYS 101',
          subjectName: 'College Physics',
          status: 'Not Evaluated',
          instructor: 'Prof. D. Reyes',
          units: '4 units'
        }
      ]
    }
  },

  methods: {
    evaluateCourse(course) {
      const actionText = course.status === 'Evaluated' ? 'view submission' : 'start evaluation';

      this.$q.notify({
        type: 'info',
        message: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} for ${course.subjectCode}`,
        position: 'top-right'
      });
    }
  }
};
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

@media (max-width: 600px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .actions-bar {
    align-items: flex-start;
  }
}
</style>
