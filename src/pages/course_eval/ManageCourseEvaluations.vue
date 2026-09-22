<template>
  <q-page padding class="evaluation-page">
    <!-- Action Header Bar -->
    <div class="row items-end q-col-gutter-lg q-mb-lg page-header">
      <div>
        <div class="text-overline text-primary text-weight-bold page-kicker">Academic operations</div>
        <div class="text-h5 text-weight-bold text-grey-9">Course Evaluations</div>
        <div class="text-caption text-grey-6">
          Standardizing Subject Criteria: Configuration & Quality Parameters.
        </div>
      </div>
      <q-space />
      <div class="view-selector q-mr-sm">
        <div class="view-selector-label">View</div>
        <q-btn-toggle
          v-model="currentView"
          class="view-switcher"
          unelevated
          no-caps
          toggle-color="primary"
          toggle-text-color="white"
          color="white"
          text-color="grey-7"
          :options="viewOptions"
        />
      </div>
      <q-btn
        v-if="canCreateEvaluation"
        unelevated
        color="primary"
        no-caps
        class="create-evaluation-btn"
        @click="openCreateModal"
      >
        <!-- 💡 This custom inner template bypasses Quasar's line-height constraints -->
        <div class="inner-btn-layout">
          <q-icon name="add" />
          <span>Create Evaluation</span>
        </div>
      </q-btn>
    </div>

    <!-- Data Table Container Filter Controls Wrapper -->
    <q-card flat bordered class="evaluation-shell overflow-hidden">
      <q-card-section class="row items-center q-col-gutter-md q-py-md filter-toolbar">
        <div class="col-12 col-lg-auto filter-heading">
          <div class="text-subtitle2 text-weight-bold text-grey-9">Evaluation register</div>
          <div class="text-caption text-grey-6">
            {{ filteredEvaluations.length }} matching record{{ filteredEvaluations.length === 1 ? '' : 's' }}
          </div>
        </div>

        <q-input
          v-model="filter"
          class="col-12 col-md-4 col-lg"
          outlined
          dense
          clearable
          label="Search evaluations..."
        >
          <template #prepend>
            <q-icon name="search" size="xs" color="grey-6" />
          </template>
        </q-input>

        <q-select
          v-model="statusFilter"
          class="col-12 col-md-3"
          outlined
          dense
          clearable
          :options="statusOptions"
          label="Status"
        />

        <q-select
          v-model="acadYearFilter"
          class="col-12 col-md-3"
          outlined
          dense
          clearable
          :options="academicYearOptions"
          label="Academic Year"
        />

        <q-select
          v-model="semesterFilter"
          class="col-12 col-md-3 col-lg-2"
          outlined
          dense
          clearable
          emit-value
          map-options
          :options="semesterOptions"
          label="Semester"
        />

        <q-btn
          v-if="hasActiveFilters"
          flat
          dense
          no-caps
          color="grey-7"
          icon="refresh"
          label="Clear"
          class="col-auto"
          @click="clearFilters"
        />
      </q-card-section>

      <!-- Table View -->
      <q-table
        v-if="currentView === 'table'"
        :rows="filteredEvaluations"
        :columns="columns"
        row-key="_id"
        :loading="loading"
        :pagination="pagination"
        flat
        square
        class="bg-white"
      >
        <!-- Table Column Header Slots Structure -->
        <template #header="props">
          <q-tr :props="props" class="bg-grey-2 text-grey-8">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-subtitle2"
              style="font-size: 0.8rem; font-weight: 600;"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Body Row Linkage Interceptors -->
        <template #body="props">
          <q-tr :props="props" class="transition-hover">
            <q-td key="acad_year" :props="props">
              {{ props.row.acad_year }}
            </q-td>
            <q-td key="sem" :props="props">
              {{ formatSemester(props.row.sem) }}
            </q-td>
            <q-td key="course_code" :props="props">
              <a
                class="text-primary text-weight-bold cursor-pointer text-underline"
                @click="navigateToDetails(props.row._id)"
              >
                {{ props.row.course_code }}
              </a>
            </q-td>
            <q-td key="course_title" :props="props">
              {{ props.row.course_title }}
            </q-td>
            <q-td key="dept_code" :props="props">
              {{ props.row.dept_code }}
            </q-td>
            <q-td key="status" :props="props">
              <q-badge
                rounded
                :color="getStatusColor(props.row.status)"
                class="q-px-sm q-py-xs text-weight-bold"
              >
                {{ props.row.status }}
              </q-badge>
            </q-td>
            <q-td key="actions" :props="props">
              <q-btn
                flat
                round
                dense
                icon="visibility"
                color="primary"
                class="q-mr-xs"
                @click="navigateToDetails(props.row._id)"
              >
                <q-tooltip>Open Detail Dashboard</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="secondary"
                @click="openEditModal(props.row)"
              >
                <q-tooltip>Modify Parameters</q-tooltip>
              </q-btn>
              <!-- q-btn for removing evaluation -->
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                :disable="!canDeleteEvaluation(props.row)"
                @click="confirmDeleteEvaluation(props.row)"
              >
                <q-tooltip>{{ canDeleteEvaluation(props.row) ? 'Remove Evaluation' : 'Only draft evaluations can be removed' }}</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <!-- Card View -->
      <q-card-section v-else-if="currentView === 'card'" class="bg-grey-1">
        <div v-if="filteredEvaluations.length" class="row q-col-gutter-md">
          <div
            v-for="evaluation in filteredEvaluations"
            :key="evaluation._id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card flat bordered class="evaluation-card full-height">
              <q-card-section class="row items-start q-pb-sm">
                <div class="col">
                  <div class="text-overline text-grey-6">{{ evaluation.acad_year }}</div>
                  <a
                    class="text-h6 text-primary text-weight-bold cursor-pointer text-underline"
                    @click="navigateToDetails(evaluation._id)"
                  >
                    {{ evaluation.course_code }}
                  </a>
                  <div class="text-body2 text-grey-8 q-mt-xs">
                    {{ evaluation.course_title }}
                  </div>
                </div>
                <q-badge
                  rounded
                  :color="getStatusColor(evaluation.status)"
                  class="q-px-sm q-py-xs text-weight-bold"
                >
                  {{ evaluation.status }}
                </q-badge>
              </q-card-section>

              <q-separator />

              <q-card-section class="row q-col-gutter-sm text-caption text-grey-7">
                <div class="col-6">
                  <div class="text-weight-medium">Semester</div>
                  <div>{{ formatSemester(evaluation.sem) }}</div>
                </div>
                <div class="col-6">
                  <div class="text-weight-medium">Department</div>
                  <div>{{ evaluation.dept_code }}</div>
                </div>
              </q-card-section>

              <q-card-actions align="right" class="q-px-md q-pb-md">
                <q-btn
                  flat
                  dense
                  icon="visibility"
                  color="primary"
                  label="Details"
                  @click="navigateToDetails(evaluation._id)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="secondary"
                  @click="openEditModal(evaluation)"
                >
                  <q-tooltip>Modify Parameters</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canDeleteEvaluation(evaluation)"
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click.stop="confirmDeleteEvaluation(evaluation)"
                >
                  <q-tooltip>Remove Evaluation</q-tooltip>
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>
        <div v-else class="text-center text-grey-6 q-pa-xl">No evaluations found.</div>
      </q-card-section>

      <!-- Pipeline View -->
      <q-card-section v-else class="bg-grey-1">
        <div class="row q-col-gutter-md items-stretch">
          <div
            v-for="lane in pipelineLanes"
            :key="lane.status"
            class="col-12 col-md-4"
            @dragover.prevent="handleLaneDragOver(lane.status)"
            @drop.prevent="moveEvaluationToStatus(lane.status)"
          >
            <q-card
              flat
              bordered
              class="pipeline-lane full-height"
              :class="[
                getStatusClass(lane.status),
                { 'pipeline-lane-drop-target': dragOverStatus === lane.status }
              ]"
            >
              <q-card-section
                class="pipeline-lane-header row items-center q-py-sm"
                :class="getStatusClass(lane.status)"
              >
                <q-icon
                  name="fiber_manual_record"
                  size="12px"
                  :color="getStatusColor(lane.status)"
                  class="q-mr-sm"
                />
                <div class="text-subtitle1 text-weight-bold">{{ lane.status }}</div>
                <q-space />
                <q-badge
                  :color="getStatusColor(lane.status)"
                  :label="lane.rows.length"
                  class="text-weight-bold"
                />
              </q-card-section>
              <q-separator />
              <q-card-section class="q-pa-sm">
                <div v-if="lane.rows.length" class="column q-gutter-sm">
                  <q-card
                    v-for="evaluation in lane.rows"
                    :key="evaluation._id"
                    flat
                    bordered
                    class="pipeline-item"
                    draggable="true"
                    @dragstart="startEvaluationDrag(evaluation)"
                    @dragend="endEvaluationDrag"
                    @click="navigateToDetails(evaluation._id)"
                  >
                    <q-card-section class="q-pa-md">
                      <div class="row items-start justify-between q-col-gutter-sm">
                        <div class="col">
                          <div class="text-subtitle2 text-primary text-weight-bold">
                            {{ evaluation.course_code }}
                          </div>
                          <div class="text-body2 text-grey-8 ellipsis-2-lines">
                            {{ evaluation.course_title }}
                          </div>
                          <div class="text-caption text-grey-6 q-mt-sm">
                            {{ evaluation.dept_code }} · {{ formatSemester(evaluation.sem) }}
                          </div>
                        </div>

                        <q-btn
                          v-if="canDeleteEvaluation(evaluation)"
                          flat
                          round
                          dense
                          icon="delete"
                          color="negative"
                          class="pipeline-delete-btn"
                          @click.stop="confirmDeleteEvaluation(evaluation)"
                        >
                          <q-tooltip>Remove Evaluation</q-tooltip>
                        </q-btn>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
                <div v-else class="text-caption text-grey-6 text-center q-pa-lg">
                  No evaluations in this stage.
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Context Meta Mutation Action Modal Dialog -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 600px; max-width: 95vw; border-radius: 8px;">
        <q-card-section class="text-h6 text-weight-bold text-grey-9">
          {{ editing ? 'Edit Evaluation Scope' : 'Initialize Evaluation Scope' }}
        </q-card-section>

        <q-card-section v-if="!editing && courseEvaluationTemplate" class="q-pt-none">
          <q-banner dense rounded class="bg-blue-1 text-primary">
            <div class="text-caption text-weight-medium">Evaluation Template</div>
            <div class="text-body2 text-weight-bold">{{ courseEvaluationTemplate.name || 'Unnamed template' }}</div>
            <div class="text-caption">Rating Scale: {{ courseEvaluationTemplate.rating_scale?.name || 'Unnamed rating scale' }}</div>
          </q-banner>
        </q-card-section>

        <q-form @submit="saveEvaluation">
          <q-card-section class="row q-col-gutter-md">
            <q-input
              v-if="hasStoredDepartment || editing"
              v-model="form.dept_code"
              class="col-12"
              outlined
              dense
              label="Department Code"
              :disable="hasStoredDepartment"
              :rules="[requiredValidation]"
            />
            <q-select
              v-else
              v-model="form.dept_code"
              class="col-12"
              outlined
              dense
              emit-value
              map-options
              :options="departmentOptions"
              label="Department"
              :rules="[requiredValidation]"
              @update:model-value="applyDepartment"
            />
            <q-input
              v-model="form.course_code"
              v-if="editing"
              class="col-12 col-md-6"
              outlined
              dense
              label="Course Code"
              readonly
              :rules="[requiredValidation]"
            />
            <q-select
              v-else
              v-model="form.course_code"
              class="col-12 col-md-6"
              outlined
              dense
              emit-value
              map-options
              :options="courseOptions"
              label="Course"
              :disable="!form.dept_code"
              :rules="[requiredValidation]"
              @update:model-value="applyCourse"
            />
            <q-input
              v-model="form.course_title"
              class="col-12 col-md-6"
              outlined
              dense
              label="Course Title"
              readonly
            />
            <q-select
              v-model="form.status"
              class="col-12"
              outlined
              dense
              :options="statusOptions"
              :disable="!editing"
              label="Initial Deployment State"
              :rules="[requiredValidation]"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md bg-grey-1">
            <q-btn
              flat
              label="Cancel"
              color="grey-7"
              v-close-popup
            />
            <q-btn
              unelevated
              color="primary"
              label="Commit Record"
              type="submit"
              :loading="saving"
              class="q-px-md"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script>
import api from 'src/API/api.js'
import { toRaw } from 'vue';
import sampleCourses from './sampleCourses.json'
import myDialog from 'src/plugins/myDialog';

export default {
  name: 'EvaluationManagementPage',

  data () {
    return {
      evaluations: [],
      loading: false,
      saving: false,
      dialog: false,
      editing: false,
      draggedEvaluation: null,
      dragOverStatus: null,
      currentView: 'table',
      viewOptions: [
        { label: 'Table', value: 'table', icon: 'view_list' },
        { label: 'Cards', value: 'card', icon: 'grid_view' },
        { label: 'Pipeline', value: 'pipeline', icon: 'view_column' }
      ],
      courseEvaluationTemplate: null,
      filter: '',
      statusFilter: null,
      acadYearFilter: null,
      semesterFilter: null,
      statusOptions: [
        'DRAFT',
        'ACTIVE',
        'CLOSED'
      ],
      semesterOptions: [
        { label: '1st Semester', value: '21' },
        { label: '2nd Semester', value: '22' },
        { label: 'Summer', value: '23' }
      ],
      departmentOptions: [],
      courses: [],
      columns: [
        { name: 'acad_year', label: 'Academic Year', field: 'acad_year', align: 'left', sortable: true },
        { name: 'sem', label: 'Semester', field: 'sem', align: 'center', sortable: true },
        { name: 'course_code', label: 'Course Code', field: 'course_code', align: 'left', sortable: true },
        { name: 'course_title', label: 'Course Title', field: 'course_title', align: 'left', sortable: true },
        { name: 'dept_code', label: 'Department', field: 'dept_code', align: 'left', sortable: true },
        { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
        { name: 'actions', label: 'Actions', align: 'right' }
      ],
      pagination: {
        rowsPerPage: 10
      },
      form: this.getInitialFormState()
    };
  },

  computed: {
    hasStoredDepartment () {
      return Boolean(String(localStorage.getItem('dept_code') || '').trim());
    },

    courseOptions () {
      const existingCourseCodes = new Set(
        this.evaluations.map(evaluation => evaluation.course_code)
      );

      return this.courses
        .filter(course => !existingCourseCodes.has(course.subjectCode))
        .map(course => ({
          label: `${course.subjectCode} - ${course.subjectName}`,
          value: course.subjectCode
        }));
    },

    currentUserRoles () {
      const storedRoles = localStorage.getItem('userRoles');
      if (!storedRoles) return [];

      let roles;
      try {
        roles = JSON.parse(storedRoles);
      } catch (error) {
        roles = storedRoles;
      }

      if (typeof roles === 'string') {
        try {
          roles = JSON.parse(roles);
        } catch (error) {
          roles = roles.replace(/^\[|\]$/g, '').split(',');
        }
      }

      return (Array.isArray(roles) ? roles : [roles])
        .filter(Boolean)
        .map(role => String(role).trim().toUpperCase());
    },

    academicYearOptions () {
      return [...new Set(
        this.evaluations
          .map(evaluation => evaluation.acad_year)
          .filter(year => year !== null && year !== undefined && year !== '')
          .map(year => String(year))
      )].sort();
    },

    hasActiveFilters () {
      return Boolean(
        this.filter ||
        this.statusFilter ||
        this.acadYearFilter ||
        this.semesterFilter
      );
    },

    canCreateEvaluation () {
      return this.currentUserRoles.includes('CHAIRPERSON') || this.currentUserRoles.includes('ADMIN');
    },

    filteredEvaluations () {
      const searchTxt = this.filter.toLowerCase().trim();

      return this.evaluations.filter((row) => {
        const matchesSearch = !searchTxt ||
          row.course_code.toLowerCase().includes(searchTxt) ||
          row.course_title.toLowerCase().includes(searchTxt) ||
          row.dept_code.toLowerCase().includes(searchTxt);

        const matchesStatus = !this.statusFilter ||
          row.status === this.statusFilter;

        const matchesAcademicYear = !this.acadYearFilter ||
          String(row.acad_year) === String(this.acadYearFilter);

        const matchesSemester = !this.semesterFilter ||
          String(row.sem) === String(this.semesterFilter);

        return matchesSearch && matchesStatus && matchesAcademicYear && matchesSemester;
      });
    },

    pipelineLanes () {
      return this.statusOptions.map(status => ({
        status,
        rows: this.filteredEvaluations.filter(row => this.getRowStatus(row) === status)
      }));
    },

  },

  mounted () {
    this.loadSampleManagementData();
  },

  methods: {
    formatSemester (value) {
      switch (value) {
        case 21: return '1st Semester';
        case 22: return '2nd Semester';
        case 23: return 'Summer';
      }
      return '';
    },

    getInitialFormState () {
      return {
        _id: null,
        acad_year: '',
        sem: 1,
        course_code: '',
        course_title: '',
        dept_code: JSON.parse(localStorage.getItem('dept_code')),
        status: 'DRAFT',
        rating_scale_id: null
      };
    },

    loadSampleManagementData () {
      this.loading = true;

      this.getEvaluations()

      this.loading = false;
    },

    canDeleteEvaluation (evaluation) {
      return String(evaluation?.status || '').toUpperCase() === 'DRAFT'
    },

    getStatusColor (status) {
      if (status === 'ACTIVE') {
        return 'positive';
      }
      if (status === 'CLOSED') {
        return 'negative';
      }
      return 'grey-7';
    },

    getStatusClass (status) {
      return `pipeline-lane-${String(status).toLowerCase()}`;
    },

    getRowStatus (row) {
      return row.status || row.stage || 'DRAFT';
    },

    clearFilters () {
      this.filter = '';
      this.statusFilter = null;
      this.acadYearFilter = null;
      this.semesterFilter = null;
    },

    startEvaluationDrag (evaluation) {
      this.draggedEvaluation = evaluation;
    },

    handleLaneDragOver (status) {
      if (this.draggedEvaluation) this.dragOverStatus = status;
    },

    endEvaluationDrag () {
      this.draggedEvaluation = null;
      this.dragOverStatus = null;
    },

    async moveEvaluationToStatus (status) {
      if (!this.draggedEvaluation) return;

      const evaluation = this.evaluations.find(
        item => item._id === this.draggedEvaluation._id
      );

      if (evaluation) {
        evaluation.status = status;
                try {
                  const evaluationPayload = evaluation
                    const confirm = await myDialog.confirm(this.$q, 'Confirm Save', 'Please confirm to save Evaluation');
                      if (!confirm) return;
                      const response = await api.updateEvaluation(evaluationPayload)
                      if(!response.success)
                        throw new Error(response.error.response.data.message || 'Failed to update evaluation');
                } catch (error) {
                  this.saving = false;
                  this.$q.notify({ type: 'negative', message: error.message || 'Unable to update evaluation. Please try again.' });
                }
      }
      this.endEvaluationDrag();
    },

    requiredValidation (value) {
      if (value === null || value === undefined || value === '') {
        return 'This information block is required';
      }
      return true;
    },

    async applyDepartment () {
      // console.log('form DC', this.form.dept_code)

      //use this when using production
      let dpt =toRaw( this.departmentOptions.find(dept => dept.value === this.form.dept_code))
      this.courses = dpt.subjects;
      
      //for development only
      // this.courses = toRaw(sampleCourses);


      this.form.course_code = '';
      this.form.course_title = '';
    },

    applyCourse (courseCode) {
      const course = this.courses.find(item => item.subjectCode === courseCode);
      if (course) {
        this.form.course_title = course.subjectName;
        if (!this.hasStoredDepartment && !this.form.dept_code) this.form.dept_code = course.department;
      }
    },

    async openCreateModal () {
      if (!this.canCreateEvaluation) {
        this.$q.notify({ type: 'warning', message: 'Only a CHAIRPERSON or admin can create an evaluation.' });
        return;
      }
      

      try {
        this.courseEvaluationTemplate = await this.getCourseEvaluationTemplate();
        let acad_year = this.courseEvaluationTemplate.acad_year
        let semCode = '';
        switch (this.courseEvaluationTemplate.sem){
          case '1st Semester': semCode = '21'; break;
          case '2nd Semester': semCode = '22'; break;
          case 'summer': semCode = '23'; break;
        }
        await this.getDepartmentWithSubjects(acad_year,semCode);
        if(this.hasStoredDepartment){
          this.applyDepartment()
        }

             // this.form = this.getInitialFormState();
              this.form = {
                _id: null,
                acad_year: acad_year,
                sem: semCode,
                course_code: '',
                course_title: '',
                dept_code: JSON.parse(localStorage.getItem('dept_code')),
                status: 'DRAFT',
                rating_scale_id: this.courseEvaluationTemplate.rating_scale_id,
              };
              this.editing = false;
              this.dialog = true;
      } catch (error) {
        this.courseEvaluationTemplate = null;
        this.$q.notify({
          type: 'negative',
          message: error.message || 'No active COURSE_EVAL template is available.'
        });
        return;
      }
    },

    openEditModal (row) {
      this.form = { ...row };
      this.editing = true;
      this.dialog = true;
    },

    async confirmDeleteEvaluation (row) {
      const confirm = await myDialog.confirm(this.$q, 'Confirm Deletion', 'Are you sure you want to delete this evaluation? This action cannot be undone.');
      if (!confirm) return;

      try {
        const response = await api.deleteEvaluation(row._id);
        if (!response.success) {
          throw new Error(response.error.response.data.message || 'Failed to delete evaluation');
        }
        this.getEvaluations();
        this.$q.notify({
          type: 'positive',
          message: 'Evaluation deleted successfully.'
        });
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Unable to delete evaluation. Please try again.'
        });
      }
    },

    navigateToDetails (id) {
      this.$router.push({
        name: 'evaluationDetails',
        params: { id: id }
      });
    },

    async getCourseEvaluationTemplate () {
      const response = await api.getEvaluationTemplateByType('COURSE_EVAL');
      if (!response || response.error || !response.success) {
        throw new Error('No active COURSE_EVAL template is available');
      }

      const templateData = Array.isArray(response.data) ? response.data[0] : response.data;
      if (!templateData) throw new Error('No active COURSE_EVAL template is available');
      return templateData;
    },

    async getDepartmentWithSubjects (acad_year,semCode) {
      const response = await api.getDepartmentWithSubjects(acad_year,semCode);
      if (!response || response.error || !response.success) {
        throw new Error('No active Department is available');
      }

      const tmpDpt = Array.isArray(response.data) ? response.data[0] : response.data;
      if (!tmpDpt) throw new Error('No active Department is available');

      // Transform the array
      this.departmentOptions = response.data.map(item => ({
        label: item.department_name + ' ['+item.department_code+']',
        value: item.department_code,
        subjects: item.subjects
      }));

      if(this.hasStoredDepartment){
      this.applyDepartment()
      }
    },

    async saveEvaluation () {
      if (!this.editing && !this.canCreateEvaluation) {
        this.$q.notify({ type: 'warning', message: 'Only a CHAIRPERSON or admin can create an evaluation.' });
        return;
      }

      if (!this.form.dept_code) {
        this.$q.notify({ type: 'warning', message: 'Select a department before creating an evaluation.' });
        return;
      }

      this.saving = true;

      if (this.editing === true) {
        try {
          const evaluationPayload = {...this.form}
            const confirm = await myDialog.confirm(this.$q, 'Confirm Save', 'Please confirm to save Evaluation');
              if (!confirm) return;
              const response = await api.updateEvaluation(evaluationPayload)
              if(!response.success)
                throw new Error(response.error.response.data.message || 'Failed to update evaluation');
        } catch (error) {
          this.saving = false;
          this.$q.notify({ type: 'negative', message: error.message || 'Unable to update evaluation. Please try again.' });
          return;
        }
      } else {
        try {
          const template = this.courseEvaluationTemplate;
          const evaluationPayload = {
            ...this.form,
            indicators: template.indicators?? []
          };
          console.log('payload', evaluationPayload)
          const confirm = await myDialog.confirm(this.$q, 'Confirm Save', 'Please confirm to save Evaluation');
		      if (!confirm) return;
          const response = await api.createEvaluation(evaluationPayload)
          if(!response.success)
            throw new Error(response.error.response.data.message || 'Failed to create evaluation');
        } catch (error) {
          this.saving = false;
          this.$q.notify({ type: 'negative', message: error.message || 'Unable to create evaluation. Please try again.' });
          return;
        }
      }

      this.getEvaluations();
      this.saving = false;
      this.dialog = false;

      this.$q.notify({
        type: 'positive',
        message: 'Evaluation added to the sample list.'
      });
    },

    async getEvaluations () {
      this.loading = true;

      try {
        const response = await api.getEvaluations();

        if (!response || response.error || !response.success) {
          throw new Error(response?.error?.response?.data?.message || 'Unable to load evaluations.');
        }

        const records = Array.isArray(response.data) ? response.data : [];
        this.evaluations = records.map((item) => ({
          ...item,
          status: item.status || 'DRAFT'
        }));
      } catch (error) {
        this.evaluations = [];
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Failed to load evaluations.'
        });
      } finally {
        this.loading = false;
      }
    },
    
  }
};

</script>
<style scoped>
.evaluation-page {
  min-height: 100%;
  background: #f4f6f8;
}
.page-header {
  min-height: 88px;
}
.page-kicker {
  letter-spacing: 0.12em;
  font-size: 0.68rem;
}
.view-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}
.view-selector-label {
  color: #7a8794;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.view-switcher {
  border: 1px solid #d5dde6;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(33, 45, 58, 0.05);
  overflow: hidden;
}
.view-switcher :deep(.q-btn) {
  min-height: 40px;
  min-width: 92px;
  padding: 0 13px;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.view-switcher :deep(.q-btn:not(.q-btn--active):hover) {
  background: #f1f4f7 !important;
  color: #263746 !important;
}
.view-switcher :deep(.q-btn + .q-btn) {
  border-left: 1px solid #e1e6eb;
}
.view-switcher :deep(.q-btn--active) {
  box-shadow: inset 0 -2px 0 rgba(255, 255, 255, 0.25);
}
.create-evaluation-btn {
  height: 40px; /* Use absolute height control */
  border-radius: 8px;
  box-shadow: 0 5px 12px rgba(25, 118, 210, 0.2);
  font-weight: 700;
  letter-spacing: 0.01em;
  padding: 0 16px; /* Restores the padding lost from removing q-px-md */
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

/* Force the child wrapper element to clear inherited button heights */
.create-evaluation-btn :deep(.q-btn__content),
.create-evaluation-btn :deep(.q-btn__wrapper) {
  height: 100% !important;
  padding: 0 !important;
}

/* 🎯 Our custom flex box layout handles precise centering calculations */
.inner-btn-layout {
  display: inline-flex;
  align-items: center;      /* Perfect vertical centering */
  justify-content: center;  /* Perfect horizontal centering */
  height: 100%;
  width: 100%;
  line-height: 1;           /* Wipes out text line alignment offsets */
}

/* Keep the horizontal gap balanced */
.inner-btn-layout .q-icon {
  font-size: 18px;
  margin-right: 6px;
}

.create-evaluation-btn:hover {
  box-shadow: 0 7px 16px rgba(25, 118, 210, 0.28);
  transform: translateY(-1px);
}

.create-evaluation-btn:active {
  box-shadow: 0 3px 8px rgba(25, 118, 210, 0.2);
  transform: translateY(0);
}

.evaluation-shell {
  border: 1px solid #dfe5eb;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(33, 45, 58, 0.06);
}
.filter-toolbar {
  background: #ffffff;
  border-bottom: 1px solid #e3e8ed;
}
.filter-heading {
  min-width: 155px;
}
.transition-hover tr {
  transition: background-color 0.15s ease;
}
.transition-hover tr:hover {
  background-color: #f8fafc !important;
}
.text-underline {
  text-decoration: underline;
}
.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}
.evaluation-card,
.pipeline-lane {
  border-radius: 8px;
}
.pipeline-lane {
  min-height: 240px;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.pipeline-lane-draft {
  border-top: 4px solid #607d8b;
}
.pipeline-lane-active {
  border-top: 4px solid #21ba45;
}
.pipeline-lane-closed {
  border-top: 4px solid #c10015;
}
.pipeline-lane-header.pipeline-lane-draft {
  background-color: #eef2f4;
}
.pipeline-lane-header.pipeline-lane-active {
  background-color: #e9f7ed;
}
.pipeline-lane-header.pipeline-lane-closed {
  background-color: #fcebed;
}
.pipeline-lane-drop-target {
  border-color: var(--q-primary);
  background-color: #f0f7ff;
}
.pipeline-item {
  cursor: pointer;
  cursor: grab;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.pipeline-item:active {
  cursor: grabbing;
}
.pipeline-item:hover {
  border-color: var(--q-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
@media (max-width: 700px) {
  .page-header {
    align-items: stretch;
  }
  .view-switcher {
    width: 100%;
    margin-right: 0;
  }
  .view-selector {
    width: 100%;
    align-items: stretch;
    flex-direction: column;
    gap: 4px;
  }
  .view-selector-label {
    font-size: 0.62rem;
  }
  .view-switcher :deep(.q-btn) {
    flex: 1;
    min-width: 0;
  }
}
</style>
