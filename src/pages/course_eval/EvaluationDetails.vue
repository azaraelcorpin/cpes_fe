<template>
  <q-page padding class="bg-grey-1">

    <!-- 1. Keep Breadcrumbs Safe (Use fallback text if loading) -->
    <q-breadcrumbs class="q-mb-md text-caption">
      <q-breadcrumbs-el label="Evaluations Management" icon="assignment" to="/course-evaluations" />
      <q-breadcrumbs-el :label="evaluation ? evaluation.course_code : 'Loading Workspace...'" icon="analytics" />
    </q-breadcrumbs>

    <!-- 2. WRAP ALL CORE ACTIONS IN V-IF -->
    <div v-if="evaluation">

      <!-- High-Level Context Header Panel -->
      <q-card flat bordered class="bg-white q-mb-md shadow-1" style="border-radius: 8px;">
        <q-card-section class="row items-center q-py-md">
          <div>
            <div class="text-h5 text-weight-bold text-grey-9">
              {{ evaluation.course_code }}: {{ evaluation.course_title }}
            </div>
            <div class="text-caption text-grey-6 font-mono q-mt-xs">
              AY: {{ evaluation.acad_year }} | Semester: {{ formatSemester(evaluation.sem) }} | Dept: {{ evaluation.dept_code }}
            </div>

            <div v-if="evaluation.status === 'ACTIVE'" class="text-caption text-negative text-weight-bold q-mt-xs row items-center">
              <q-icon name="lock" class="q-mr-xs" /> System Lock: Details are read-only unless the evaluation is in DRAFT status.
            </div>
          </div>
          <q-space />
          <div class="row items-center q-gutter-sm">
            <q-btn
              unelevated
              color="primary"
              icon="assignment"
              label="View Evaluation Form"
              :to="{ name: 'studentCourseEvaluationForm', params: { id: evaluation._id } }"
            />
            <q-badge rounded :color="getStatusColor(evaluation.status)" class="q-px-md q-py-xs text-weight-bold">
              {{ evaluation.status }}
            </q-badge>
          </div>
        </q-card-section>
      </q-card>

      <q-tabs v-model="activeTab" dense align="left" active-color="primary" indicator-color="primary" class="bg-white shadow-1 rounded-borders q-mb-md">
        <q-tab name="details" icon="account_tree" label="Details" />
        <q-tab name="summary" icon="insights" label="Summary" />
        <q-tab name="action-report" icon="assignment_turned_in" label="Action Report" />
        <q-tab name="members" icon="groups" label="Members" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated class="bg-transparent">
        <q-tab-panel name="details" class="q-pa-none">
          <q-card flat bordered class="bg-white">
            <q-card-section class="row items-center justify-between details-heading">
              <div>
                <div class="text-subtitle1 text-weight-bold">Indicators and Evaluation Items</div>
                <div class="text-caption text-grey-6">Manage the questions and assigned authority for this evaluation.</div>
              </div>
              <div class="details-summary">
                <div class="details-summary-stat">
                  <span class="text-h6 text-weight-bold text-primary">{{ evaluation.indicators?.length || 0 }}</span>
                  <span class="text-caption text-grey-6">Indicators</span>
                </div>
                <div class="details-summary-stat">
                  <span class="text-h6 text-weight-bold text-primary">{{ totalEvaluationItems }}</span>
                  <span class="text-caption text-grey-6">Items</span>
                </div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section v-if="evaluation.indicators && evaluation.indicators.length" class="indicator-list">
              <q-card
                v-for="(indicator, indicatorIndex) in evaluation.indicators"
                :key="indicator._id"
                flat
                bordered
                class="indicator-card"
              >
                <q-card-section class="indicator-header">
                  <q-avatar color="primary" text-color="white" size="38px" class="indicator-number">
                    {{ indicator.sort_order || indicatorIndex + 1 }}
                  </q-avatar>
                  <div class="col q-ml-md">
                    <div class="text-subtitle1 text-weight-bold text-grey-9">
                      {{ indicator.indicator_name || indicator.name }}
                    </div>
                    <div class="row items-center q-gutter-none q-mt-none text-caption text-grey-6">
                      <span class="text-weight-medium">{{ indicator.assigned_role || 'Unassigned' }}</span>
                      <span class="q-ml-xs">
                        {{ indicator.items?.length || 0 }} item{{ (indicator.items?.length || 0) === 1 ? '' : 's' }}
                      </span>
                    </div>
                  </div>
                  <q-btn
                    v-if="canManageItems(indicator)"
                    flat
                    round
                    dense
                    icon="playlist_add"
                    color="primary"
                    @click="openCreateItem(indicator)"
                  >
                    <q-tooltip>Add evaluation item</q-tooltip>
                  </q-btn>
                </q-card-section>
                <q-list separator>
                  <q-item v-for="(item, itemIndex) in indicator.items" :key="item._id" class="evaluation-item">
                    <q-item-section avatar>
                      <q-avatar color="grey-2" text-color="grey-8" size="28px">{{ item.sort_order || itemIndex + 1 }}</q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-body2 text-weight-medium">{{ item.name }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div v-if="canManageItems(indicator)" class="row no-wrap">
                        <q-btn flat round dense icon="edit" color="primary" @click="openEditItem(indicator, item, itemIndex)">
                          <q-tooltip>Edit item</q-tooltip>
                        </q-btn>
                        <q-btn flat round dense icon="delete_outline" color="negative" @click="deleteItem(indicator, itemIndex)">
                          <q-tooltip>Delete item</q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>
                  </q-item>
                  <q-item v-if="!indicator.items || !indicator.items.length" class="empty-items">
                    <q-item-section avatar><q-icon name="playlist_add" color="grey-5" /></q-item-section>
                    <q-item-section class="text-caption text-grey-6">No evaluation items configured.</q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </q-card-section>
            <q-card-section v-else class="text-center text-grey-6 q-pa-xl">No indicators configured.</q-card-section>
          </q-card>
        </q-tab-panel>

        <q-tab-panel name="summary" class="q-pa-none">
          <q-card flat bordered class="bg-white">
            <q-card-section><div class="text-subtitle1 text-weight-bold">Response Summary</div><div class="text-caption text-grey-6">Mean, median, and mode by indicator.</div></q-card-section>
            <q-markup-table flat separator="horizontal">
              <thead><tr><th class="text-left">Indicator</th><th class="text-right">Mean</th><th class="text-right">Median</th><th class="text-right">Mode</th><th class="text-right">Responses</th></tr></thead>
              <tbody>
                <tr v-for="stat in responseStats" :key="stat._id"><td>{{ stat.indicator_name }}</td><td class="text-right">{{ stat.mean ?? stat.current_average ?? '—' }}</td><td class="text-right">{{ stat.median ?? '—' }}</td><td class="text-right">{{ stat.mode ?? '—' }}</td><td class="text-right">{{ stat.total_respondents ?? 0 }}</td></tr>
                <tr v-if="!responseStats.length"><td colspan="5" class="text-center text-grey-6">No response summary available.</td></tr>
              </tbody>
            </q-markup-table>
          </q-card>
        </q-tab-panel>

        <q-tab-panel name="action-report" class="q-pa-none">
          <q-card flat bordered class="bg-white">
            <q-card-section><div class="text-subtitle1 text-weight-bold">Action Report by Indicator</div><div class="text-caption text-grey-6">Capture remarks and action items for each indicator.</div></q-card-section>
            <q-list separator>
              <q-item v-for="indicator in evaluation.indicators" :key="indicator._id" class="q-py-md">
                <q-item-section><q-item-label class="text-weight-bold">{{ indicator.name }}</q-item-label><q-item-label caption>{{ actionReportFor(indicator)._id ? 'Report recorded' : 'No report recorded' }}</q-item-label></q-item-section>
                <q-item-section class="col-12 col-md-4"><q-input :model-value="actionReportFor(indicator).remarks" dense outlined label="Remarks" :disable="!isDraft" @update:model-value="value => updateActionReport(indicator, 'remarks', value)" /></q-item-section>
                <q-item-section class="col-12 col-md-4"><q-input :model-value="actionReportFor(indicator).action" dense outlined label="Action" :disable="!isDraft" @update:model-value="value => updateActionReport(indicator, 'action', value)" /></q-item-section>
                <q-item-section side><q-btn icon="save" flat round color="primary" :disable="!isDraft" @click="saveActionReport(indicator)" /></q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </q-tab-panel>

        <q-tab-panel name="members" class="q-pa-none">
          <q-card flat bordered class="bg-white">
            <q-card-section class="row items-center justify-between"><div><div class="text-subtitle1 text-weight-bold">Action Members</div><div class="text-caption text-grey-6">Users assigned to this evaluation.</div></div><q-btn v-if="canAssignMembers" unelevated color="primary" icon="person_add" label="Assign Member" @click="openAssignMember" /></q-card-section>
            <q-list v-if="evaluation.members && evaluation.members.length" separator>
              <q-item v-for="member in evaluation.members" :key="member._id">
                <q-item-section avatar><q-avatar color="primary" text-color="white">{{ (member.fullname || 'U').charAt(0) }}</q-avatar></q-item-section>
                <q-item-section><q-item-label class="text-weight-bold">{{ member.fullname }}</q-item-label><q-item-label caption>{{ member.email }}</q-item-label></q-item-section>
                <q-item-section side>
                  <q-badge color="blue-grey-1" text-color="blue-grey-9">{{ member.role }}
                    <q-btn v-if="canAssignMembers" flat round dense icon="delete" color="primary" @click="removeMember(member)" class="q-ml-sm"><q-tooltip>Remove member</q-tooltip></q-btn>
                  </q-badge>
                  <!-- create edit and delete buttons -->
                </q-item-section>
              </q-item>
            </q-list>
            <q-card-section v-else class="text-center text-grey-6 q-pa-xl">No action members assigned.</q-card-section>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>

      <q-dialog v-model="dialog.show">
        <q-card style="width: 600px; max-width: 95vw">
          <q-card-section class="text-h6">{{ dialog.title }}</q-card-section>
          <q-form @submit="handleDialogFormSubmission">
            <q-card-section v-if="dialog.type === 'INDICATOR'" class="row q-col-gutter-md">
              <q-input v-model="formIndicator.name" class="col-12" outlined label="Indicator name" :rules="[requiredFieldValidation]" />
              <q-input v-model.number="formIndicator.sort_order" class="col-6" outlined type="number" label="Sort order" :rules="[requiredFieldValidation]" />
              <q-input v-model="formIndicator.assigned_role" class="col-6" outlined label="Assigned role" :rules="[requiredFieldValidation]" />
            </q-card-section>
            <q-card-section v-else class="row q-col-gutter-md"><q-input v-model="formItem.name" class="col-12" outlined label="Question item" :rules="[requiredFieldValidation]" /><q-input v-model.number="formItem.sort_order" class="col-12" outlined type="number" label="Sort order" :rules="[requiredFieldValidation]" /></q-card-section>
            <q-card-actions align="right"><q-btn flat label="Cancel" v-close-popup /><q-btn color="primary" label="Save" type="submit" /></q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>

      <q-dialog v-model="memberDialog.show">
        <q-card style="width: 620px; max-width: 95vw">
          <q-card-section class="text-h6">Assign Evaluation Member</q-card-section>
          <q-form @submit="assignMember">
            <q-card-section class="q-gutter-md">
              <q-select
                v-model="memberForm.facultyId"
                outlined
                emit-value
                map-options
                :options="availableFaculties"
                option-label="fullname"
                option-value="employeeId"
                label="Faculty"
                :rules="[requiredFieldValidation]"
              >
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.fullname }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.employeeNumber }} | {{ scope.opt.dept_code }} | {{ scope.opt.email }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-select v-model="memberForm.role" outlined :options="memberRoleOptions" label="Member role" :rules="[requiredFieldValidation]" />
              <q-banner v-if="selectedFaculty" dense class="bg-grey-2 text-grey-8">
                {{ selectedFaculty.fullname }} · {{ selectedFaculty.employeeNumber }} · {{ selectedFaculty.dept_code }}
              </q-banner>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn color="primary" label="Assign" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>

    </div>

    <!-- 3. RENDER LOADER SKELETON WHILE OBJECT IS NULL -->
    <div v-else class="flex flex-center q-py-xl" style="min-height: 50vh;">
      <div class="text-center">
        <q-spinner-cube color="primary" size="3.5em" />
        <div class="text-caption text-grey-6 q-mt-md text-weight-medium">
          Streaming Structural Mapping Matrix...
        </div>
      </div>
    </div>

  </q-page>
</template>

<script>
import api from 'src/API/api.js'
import sampleFacultyList from 'src/pages/course_eval/sampleFaculties.json'
import myDialog from 'src/plugins/myDialog';

export default {
  name: 'EvaluationDetailsWorkspace',

  data () {
    return {
      // Main Structural State Containers
      evaluation: null,
      loading: false,
      saving: false,
      activeTab: this.$route.query?.tab || 'details',

      // Dynamic Component Data Pools
      actionReports: [],
      responseStats: [],

      // Modal Forms Interaction Tracker State
      dialog: {
        show: false,
        type: '',
        title: '',
        targetRef: null,
        index: null
      },

      memberDialog: {
        show: false
      },
      memberRoleOptions: ['COORDINATOR', 'MEMBER'],
      memberForm: {
        facultyId: null,
        role: 'MEMBER'
      },

      // Sample faculty records from the faculty directory schema.
      faculties: sampleFacultyList,

      // Form Model Blueprints matching schema signatures
      formIndicator: {
        _id: null,
        evaluation_id: null,
        name: '',
        sort_order: 1,
        assigned_role: 'COORDINATOR',
        items: []
      },

      formItem: {
        _id: null,
        indicator_id: null,
        name: '',
        sort_order: 1
      }
    };
  },
  
  watch: {
    activeTab (newTab) {
      this.$router.replace({ query: { ...this.$route.query, tab: newTab }});
    }
  },

  computed: {
    isDraft () {
      return this.evaluation?.status === 'DRAFT';
    },

    totalEvaluationItems () {
      return (this.evaluation?.indicators || []).reduce(
        (total, indicator) => total + (indicator.items?.length || 0),
        0
      );
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

    canAssignMembers () {
      return this.isDraft && (this.currentUserRoles.includes('CHAIRPERSON') || this.currentUserRoles.includes('ADMIN'));
    },

    selectedFaculty () {
      return this.faculties.find(faculty => String(faculty.employeeId) === String(this.memberForm.facultyId));
    },

    availableFaculties () {
      const assignedEmails = (this.evaluation?.members || []).map(member => String(member.email || '').trim().toLowerCase());
      return this.faculties.filter(faculty => !assignedEmails.includes(String(faculty.email || '').trim().toLowerCase())).filter(faculty => faculty.dept_code === this.evaluation.dept_code );
    }
  },

  async mounted () {
    await this.fetchDeepEvaluationStructure();
    this.fetchFacultiesWithDepartments();
  },

  methods: {
    formatSemester (value) {
      switch (String(value)) {
        case '21': return '1st Semester';
        case '22': return '2nd Semester';
        case '23': return 'Summer';
        default: return 'Unknown Semester';
      }
    },

    canManageItems (indicator) {
      if (!this.isDraft) return false;
      const assignedRole = String(indicator?.assigned_role || '').trim().toUpperCase();
        const editableRoles = ['CHAIRPERSON', 'COORDINATOR'];

        return editableRoles.includes(assignedRole) && (
          this.currentUserRoles.includes(assignedRole) ||
          this.currentUserRoles.includes('ADMIN')
        );
    },

    //Remove member from evaluation members list
    async removeMember(member){
      if (!this.canAssignMembers) {
        this.$q.notify({ type: 'warning', message: 'Only a CHAIRPERSON can remove evaluation members.' });
        return;
      }

      const confirmed = await myDialog.confirm(this.$q,'Confirm Member Removal',`Are you sure you want to remove ${member.fullname} from this evaluation?`);
      if (!confirmed) return;

      try{
        const response = await api.deleteEvaluationMember(member._id);
        if(!response || response.error || !response.success){
          throw new Error(response?.error?.response?.data?.message || 'Failed to remove member.');
        }
        this.$q.notify({ type: 'positive', message: `${member.fullname} removed successfully.` });
        this.fetchEvaluationMembers();

      }catch (error) {
        this.$q.notify({ type: 'negative', message: error.message || 'Failed to remove member.' });
        return;
      }
    },

    openAssignMember () {
      if (!this.canAssignMembers) {
        this.$q.notify({ type: 'warning', message: 'Only a CHAIRPERSON can assign evaluation members.' });
        return;
      }
      this.memberForm = { facultyId: null, role: 'MEMBER' };
      this.memberDialog.show = true;
    },

    async assignMember () {
      if (!this.canAssignMembers) {
        this.$q.notify({ type: 'warning', message: 'Only a CHAIRPERSON can assign evaluation members.' });
        return;
      }
      
      const faculty = this.selectedFaculty;
      if (!faculty) return;

      const facultyEmail = String(faculty.email || '').trim().toLowerCase();
      const alreadyAssigned = this.evaluation.members?.some(member => String(member.email || '').trim().toLowerCase() === facultyEmail);

      if (alreadyAssigned) {
        this.$q.notify({ type: 'warning', message: `${faculty.fullname} is already assigned to this evaluation.` });
        return;
      }

      if (this.memberForm.role === 'COORDINATOR' && this.evaluation.members?.some(member => member.role === 'COORDINATOR')) {
        this.$q.notify({ type: 'warning', message: 'Only one COORDINATOR can be assigned to an evaluation.' });
        return;
      }

      if(!this.evaluation.members) {
        this.evaluation.members = [];
      }

      const newMember = {
        evaluation_id: this.evaluation._id,
        fullname: faculty.fullname,
        email: faculty.email,
        role: this.memberForm.role
      }
      try {
        const response = await api.createEvaluationMember(newMember);
        if (!response || response.error || !response.success) {
          throw new Error(response?.error?.response?.data?.message || 'Failed to assign member.');
        }
        this.fetchEvaluationMembers();

      }catch (error) {
        this.$q.notify({ type: 'negative', message: error.message || 'Failed to assign member.' });
        return;
      }
      this.memberDialog.show = false;
      this.$q.notify({ type: 'positive', message: `${faculty.fullname} assigned successfully.` });
    },

    // get all evaluation members for the current evaluation
    async fetchEvaluationMembers () {
      const targetId = this.$route.params.id;

      if (!targetId) {
        throw new Error('Evaluation id is required.');
      }

      try {
        const response = await api.getEvaluationMembersByEvaluationId(targetId);

        if (!response || response.error || !response.success) {
          throw new Error(response?.error?.response?.data?.message || 'Unable to load evaluation members.');
        }
        console.log('evaluation Member',this.evaluation)
        if(!this.evaluation.members)
          this.evaluation.members = [];
        this.evaluation.members = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        this.evaluation.members = [];
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Failed to load evaluation members.'
        });
      }
    },

    //getFacultiesWithDepartments from api
    async fetchFacultiesWithDepartments () {
      try {
        const dept_code = this.evaluation?.dept_code;
        const response = await api.getFacultiesWithDepartments(dept_code);
        if (!response || response.error || !response.success) {
          throw new Error(response?.error?.response?.data?.message || 'Unable to load faculties.');
        }
        this.faculties = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        this.faculties = [];
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Failed to load faculties.'
        });
      }
    },

    async fetchDeepEvaluationStructure () {
      this.loading = true;
      const targetId = this.$route.params.id;

      if (!targetId) {
        throw new Error('Evaluation id is required.');
      }

      try {
        const response = await api.getByEvaluation_Id(targetId);

        if (!response || response.error || !response.success) {
          throw new Error(response?.error?.response?.data?.message || 'Unable to load evaluation details.');
        }

        const details = Array.isArray(response.data) ? response.data[0] : response.data;
        if (!details) throw new Error('Evaluation details were not found.');

        this.evaluation = this.normalizeEvaluationDetails(details);
        this.actionReports = details.actionReports || details.action_reports || [];
        this.responseStats = details.responseStats || details.response_stats || [];
        this.fetchEvaluationMembers(targetId);
      } catch (error) {
        this.evaluation = null;
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Failed to load evaluation details.'
        });
      } finally {
        this.loading = false;
      }
    },

    normalizeEvaluationDetails (details) {
      const indicators = details.indicators || details.evaluation_indicators || [];
      const evaluationItems = details.evaluation_items || details.evaluationItems || [];

      return {
        ...details,
        indicators: indicators.map((indicator) => {
          const indicatorItems = indicator.items || indicator.evaluation_items || indicator.evaluationItems;
          const items = indicatorItems?.length ? indicatorItems : evaluationItems.filter((item) => {
            const itemIndicatorId = item.indicator_id || item.indicatorId;
            return String(itemIndicatorId) === String(indicator._id || indicator.id);
          });

          return {
            ...indicator,
            items: Array.isArray(items) ? items.map((item, index) => ({
              ...item,
              sort_order: item.sort_order || item.sortOrder || index + 1,
              name: item.name || item.item_name || item.itemName || item.question || 'Unnamed evaluation item'
            })) : []
          };
        })
      };
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

    getReportStatusColor (status) {
      if (status === 'APPROVED') {
        return 'positive';
      }
      return 'warning';
    },

    getScoreColor (score) {
      if (score >= 4.5) {
        return 'teal-7';
      }
      if (score >= 3.5) {
        return 'primary';
      }
      return 'orange-8';
    },

    actionReportFor (indicator) {
      let report = this.actionReports.find(item => String(item.indicator_id) === String(indicator._id));
      if (!report) {
        report = { _id: null, indicator_id: indicator._id, evaluation_id: this.evaluation._id, remarks: '', action: '' };
        this.actionReports.push(report);
      }
      return report;
    },

    updateActionReport (indicator, field, value) {
      this.actionReportFor(indicator)[field] = value;
    },

    saveActionReport (indicator) {
      const report = this.actionReportFor(indicator);
      this.$q.notify({ type: 'positive', message: `Action report for ${indicator.name} updated.` });
      return report;
    },

    requiredFieldValidation (value) {
      if (value === null || value === undefined || value === '') {
        return 'Field parameter validation failure: cannot be empty';
      }
      return true;
    },

    notifyStateLockout () {
      this.$q.notify({
        type: 'warning',
        message: 'Security Halt: Details are read-only unless the evaluation is in DRAFT status.',
        position: 'top',
        timeout: 2500
      });
    },

    // --- 📋 Tab 1: Indicator Manipulation Contexts ---
    openCreateIndicator () {
      if (!this.isDraft) {
        this.notifyStateLockout();
        return;
      }

      this.formIndicator = {
        _id: null,
        evaluation_id: this.evaluation._id,
        name: '',
        sort_order: this.evaluation.indicators.length + 1,
        assigned_role: 'STUDENT',
        items: []
      };

      this.dialog = {
        show: true,
        type: 'INDICATOR',
        title: 'Append New Evaluation Indicator Block',
        targetRef: null,
        index: null
      };
    },

    openEditIndicator (indicator, index) {
      if (!this.isDraft) {
        this.notifyStateLockout();
        return;
      }

      this.formIndicator = { ...indicator };

      this.dialog = {
        show: true,
        type: 'INDICATOR',
        title: 'Modify Indicator Configuration Block',
        targetRef: indicator,
        index: index
      };
    },

    deleteIndicator (index) {
      if (!this.isDraft) {
        this.notifyStateLockout();
        return;
      }

      this.$q.dialog({
        title: 'Confirm Deletion Operation',
        message: 'Purging this indicator section will recursively drop all contained evaluation item prompts underneath it. Proceed?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.evaluation.indicators.splice(index, 1);
        this.$q.notify({
          type: 'info',
          message: 'Indicator profile subset discarded.'
        });
      });
    },

    // --- 📋 Tab 1: Sub-Item Prompt Criteria Handling ---
    openCreateItem (parentIndicator) {
      if (!this.isDraft || !this.canManageItems(parentIndicator)) {
        this.notifyStateLockout();
        return;
      }

      this.formItem = {
        _id: null,
        indicator_id: parentIndicator._id || parentIndicator.id || parentIndicator.indicator_id,
        name: '',
        sort_order: (parentIndicator.items?.length || 0) + 1
      };

      this.dialog = {
        show: true,
        type: 'ITEM',
        title: `Append Criteria to: ${parentIndicator.name}`,
        targetRef: parentIndicator,
        index: null
      };
    },

    openEditItem (parentIndicator, currentItem, index) {
      if (!this.isDraft || !this.canManageItems(parentIndicator)) {
        this.notifyStateLockout();
        return;
      }

      this.formItem = { ...currentItem };

      this.dialog = {
        show: true,
        type: 'ITEM',
        title: 'Modify Question Prompt Syntax Parameters',
        targetRef: parentIndicator,
        index: index
      };
    },

    async deleteItem (parentIndicator, index) {
      if (!this.isDraft || !this.canManageItems(parentIndicator)) {
        this.notifyStateLockout();
        return;
      }

      const item = parentIndicator.items[index];
      const confirmed = await this.confirmItemAction('Are you sure you want to delete this evaluation item?');
      if (!confirmed) return;

      this.saving = true;

      try {
        const response = await api.deleteEvaluationItem(item._id);
        if (!response || response.error || !response.success) {
          throw new Error(response?.error?.response?.data?.message || 'Failed to delete evaluation item.');
        }

        parentIndicator.items.splice(index, 1);
        this.$q.notify({ type: 'positive', message: 'Evaluation item deleted.' });
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Unable to delete evaluation item.'
        });
      } finally {
        this.saving = false;
      }
    },

    confirmItemAction (message) {
      return new Promise((resolve) => {
        this.$q.dialog({
          title: 'Confirm Evaluation Item Change',
          message,
          cancel: true,
          persistent: true
        })
          .onOk(() => resolve(true))
          .onCancel(() => resolve(false))
          .onDismiss(() => resolve(false));
      });
    },

    // --- 🛠️ Shared Form Submission Interceptor Operations ---
    async handleDialogFormSubmission () {
      if (this.dialog.type === 'INDICATOR') {
        this.processIndicatorMutation();
      } else if (this.dialog.type === 'ITEM') {
        const saved = await this.processItemMutation();
        if (saved === false) return;
      }

      this.dialog.show = false;
    },

    processIndicatorMutation () {
      if (this.dialog.index !== null) {
        // Handle Edit operation updates
        this.evaluation.indicators.splice(this.dialog.index, 1, { ...this.formIndicator });
        this.$q.notify({ type: 'positive', message: 'Indicator parameters adjusted.' });
      } else {
        // Handle New group block pushes
        this.formIndicator._id = 'ind_' + Date.now();
        this.evaluation.indicators.push({ ...this.formIndicator });
        this.$q.notify({ type: 'positive', message: 'New indicator segment appended.' });
      }
    },

    async processItemMutation () {
      const targetedIndicator = this.dialog.targetRef;
      const items = targetedIndicator.items || [];
      const itemName = String(this.formItem.name || '').trim().toLowerCase();
      const itemSortOrder = Number(this.formItem.sort_order);
      const duplicateItem = items.some((item, index) => {
        if (this.dialog.index !== null && index === this.dialog.index) return false;

        return Number(item.sort_order) === itemSortOrder ||
          String(item.name || '').trim().toLowerCase() === itemName;
      });

      if (duplicateItem) {
        this.$q.notify({
          type: 'warning',
          message: 'Each evaluation item must have a unique sort order and question.'
        });
        return false;
      }

      this.formItem.name = String(this.formItem.name || '').trim();
      targetedIndicator.items = items;

      const indicatorId = this.formItem.indicator_id ||
        targetedIndicator._id ||
        targetedIndicator.id ||
        targetedIndicator.indicator_id;
      const isEditing = this.dialog.index !== null;

      if (!indicatorId) {
        this.$q.notify({
          type: 'negative',
          message: 'Cannot save evaluation item because its indicator_id is missing.'
        });
        return false;
      }

      if (isEditing && !this.formItem._id) {
        this.$q.notify({
          type: 'negative',
          message: 'Cannot update evaluation item because its id is missing.'
        });
        return false;
      }

      const confirmed = await this.confirmItemAction(
        `Confirm ${isEditing ? 'updating' : 'adding'} this evaluation item?`
      );
      if (!confirmed) return false;

      this.saving = true;

      try {
        const payload = {
          _id: this.formItem._id,
          indicator_id: indicatorId,
          name: this.formItem.name,
          sort_order: Number(this.formItem.sort_order)
        };
        const response = isEditing
          ? await api.updateEvaluationItem(payload)
          : await api.createEvaluationItem(payload);

        if (!response || response.error || !response.success) {
          throw new Error(response?.error?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} evaluation item.`);
        }

        const returnedItem = response.data && !Array.isArray(response.data)
          ? response.data
          : payload;
        const savedItem = { ...payload, ...returnedItem };

        if (isEditing) {
          targetedIndicator.items.splice(this.dialog.index, 1, savedItem);
        } else {
          targetedIndicator.items.push(savedItem);
        }

        this.sortEvaluationItems(targetedIndicator);
        this.$q.notify({
          type: 'positive',
          message: `Evaluation item ${isEditing ? 'updated' : 'added'}.`
        });
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Unable to save evaluation item.'
        });
        return false;
      } finally {
        this.saving = false;
      }

      return true;
    },

    sortEvaluationItems (indicator) {
      indicator.items.sort((firstItem, secondItem) => {
        const firstOrder = Number(firstItem.sort_order);
        const secondOrder = Number(secondItem.sort_order);

        if (Number.isNaN(firstOrder) && Number.isNaN(secondOrder)) return 0;
        if (Number.isNaN(firstOrder)) return 1;
        if (Number.isNaN(secondOrder)) return -1;
        return firstOrder - secondOrder;
      });
    }
  }
};

</script>

<style scoped>
.details-heading {
  min-height: 78px;
}
.details-summary {
  display: flex;
  gap: 18px;
}
.details-summary-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.1;
}
.indicator-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #f8fafc;
}
.indicator-card {
  overflow: hidden;
  border-color: #e1e7ed;
  border-radius: 8px;
}
.indicator-header {
  display: flex;
  align-items: center;
  min-height: 74px;
  background: #ffffff;
}
.indicator-number {
  flex: 0 0 auto;
  font-size: 0.95rem;
  font-weight: 700;
}
.evaluation-item {
  min-height: 58px;
  background: #ffffff;
  transition: background-color 0.15s ease;
}
.evaluation-item:hover {
  background: #f8fafc;
}
.empty-items {
  min-height: 64px;
  background: #fcfdfe;
}
.font-mono {
  font-family: monospace;
}
.border-bottom {
  border-bottom: 1px solid #e2e8f0;
}
.transition-hover:hover {
  background-color: #f8fafc;
  transition: background-color 0.15s ease-in-out;
}
@media (max-width: 600px) {
  .details-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
  .details-summary-stat {
    align-items: flex-start;
  }
  .indicator-header {
    align-items: flex-start;
  }
}
</style>
