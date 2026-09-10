<template>
  <q-page padding class="bg-grey-1">
    <!-- Action Header Bar -->
    <div class="row items-center q-mb-xl">
      <div>
        <div class="text-h5 text-weight-bold text-grey-9">Course Evaluations</div>
        <div class="text-caption text-grey-6">
          Manage general configuration parameters and tracking schedules.
        </div>
      </div>
      <q-space />
      <q-btn 
        v-if="canCreateEvaluation"
        unelevated 
        color="primary" 
        icon="add" 
        label="Create Evaluation" 
        class="q-px-md" 
        @click="openCreateModal" 
      />
    </div>

    <!-- Data Table Container Filter Controls Wrapper -->
    <q-card flat bordered class="shadow-1 overflow-hidden" style="border-radius: 8px;">
      <q-card-section class="row q-col-gutter-md q-py-md bg-white border-bottom">
        <q-input 
          v-model="filter" 
          class="col-12 col-md-4" 
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
      </q-card-section>

      <!-- Course Evaluation Matrix Summary Grid -->
      <q-table 
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
              {{ props.row.sem }}
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
            </q-td>
          </q-tr>
        </template>
      </q-table>
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
              :rules="[requiredValidation]" 
            />
            <q-select 
              v-model="form.status" 
              class="col-12" 
              outlined 
              dense 
              :options="statusOptions" 
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

export default {
  name: 'EvaluationManagementPage',
  
  data () {
    return {
      evaluations: [],
      loading: false,
      saving: false,
      dialog: false,
      editing: false,
      courseEvaluationTemplate: null,
      filter: '',
      statusFilter: null,
      statusOptions: [
        'DRAFT', 
        'ACTIVE', 
        'CLOSED'
      ],
      departmentOptions: [
        { label: 'Department of Computer Science', value: 'DCS' },
        { label: 'Department of Information Technology', value: 'DIT' },
        { label: 'Department of Mathematics and Statistics', value: 'DMS' }
      ],
      courses: [
        { code: 'CS-312', title: 'Database Management Systems II', department: 'DCS' },
        { code: 'CS-315', title: 'Web Systems and Technologies', department: 'DCS' },
        { code: 'IT-221', title: 'Data Structures and Algorithms', department: 'DIT' },
        { code: 'MS-201', title: 'Applied Statistics', department: 'DMS' }
      ],
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
      return this.courses
        .filter(course => !this.form.dept_code || course.department === this.form.dept_code)
        .map(course => ({
        label: `${course.code} - ${course.title}`,
        value: course.code
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
          
        return matchesSearch && matchesStatus;
      });
    }
  },

  mounted () {
    this.loadSampleManagementData();
  },

  methods: {
    getInitialFormState () {
      return {
        _id: null,
        acad_year: '',
        sem: 1,
        course_code: '',
        course_title: '',
        dept_code: JSON.parse(String(localStorage.getItem('dept_code') || '')).trim(),
        status: 'DRAFT',
        rating_scale_id: null
      };
    },

    loadSampleManagementData () {
      this.loading = true;
      
      this.evaluations = [
        {
          _id: "eval_01",
          acad_year: "2026-2027",
          sem: "1st Semester",
          course_code: "CS-312",
          course_title: "Database Management Systems II",
          dept_code: "DCS",
          status: "ACTIVE",
          rating_scale_id: "scale_abc"
        },
        {
          _id: "eval_02",
          acad_year: "2026-2027",
          sem: "1st Semester",
          course_code: "CS-315",
          course_title: "Web Systems and Technologies",
          dept_code: "DCS",
          status: "DRAFT",
          rating_scale_id: "scale_abc"
        },
        {
          _id: "eval_03",
          acad_year: "2025-2026",
          sem: "2nd Semester",
          course_code: "IT-221",
          course_title: "Data Structures and Algorithms",
          dept_code: "DIT",
          status: "CLOSED",
          rating_scale_id: "scale_xyz"
        }
      ];
      
      this.loading = false;
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

    requiredValidation (value) {
      if (value === null || value === undefined || value === '') {
        return 'This information block is required';
      }
      return true;
    },

    applyDepartment () {
      this.form.course_code = '';
      this.form.course_title = '';
    },

    applyCourse (courseCode) {
      const course = this.courses.find(item => item.code === courseCode);
      if (course) {
        this.form.course_title = course.title;
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
      } catch (error) {
        this.courseEvaluationTemplate = null;
        this.$q.notify({
          type: 'negative',
          message: error.message || 'No active COURSE_EVAL template is available.'
        });
        return;
      }

      this.form = this.getInitialFormState();
      this.editing = false;
      this.dialog = true;
    },

    openEditModal (row) {
      this.form = { ...row };
      this.editing = true;
      this.dialog = true;
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
        const matchIndex = this.evaluations.findIndex((item) => {
          return item._id === this.form._id;
        });
        
        if (matchIndex !== -1) {
          this.evaluations.splice(matchIndex, 1, { ...this.form });
        }
      } else {
        try {
          const template = this.courseEvaluationTemplate || await this.getCourseEvaluationTemplate();
          const evaluationPayload = {
            ...this.form,
            acad_year: template.acad_year,
            sem: template.sem,
            rating_scale_id: this.form.rating_scale_id || template.rating_scale_id
          };

          if (!evaluationPayload.acad_year || evaluationPayload.sem === undefined || evaluationPayload.sem === null) {
            throw new Error('The active COURSE_EVAL template has no academic year or semester.');
          }

          if (template._id !== undefined) evaluationPayload.evaluation_template_id = template._id;
          else if (template.id !== undefined) evaluationPayload.evaluation_template_id = template.id;

          this.evaluations.unshift(evaluationPayload);
          console.log('New evaluation added:', evaluationPayload);
        } catch (error) {
          this.saving = false;
          this.$q.notify({ type: 'negative', message: error.message || 'Unable to create evaluation. Please try again.' });
          return;
        }
      }
      
      this.saving = false;
      this.dialog = false;
      
      this.$q.notify({
        type: 'positive',
        message: 'Evaluation added to the sample list.'
      });
    }
  }
};

</script>
<style scoped>
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
</style>
