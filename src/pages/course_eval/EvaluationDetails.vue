<template>
  <q-page padding class="bg-grey-1">
    
    <!-- 1. Keep Breadcrumbs Safe (Use fallback text if loading) -->
    <q-breadcrumbs class="q-mb-md text-caption">
      <q-breadcrumbs-el label="Evaluations Management" icon="assignment" to="/manage-evaluations" />
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
              AY: {{ evaluation.acad_year }} | Semester: 0{{ evaluation.sem }} | Dept: {{ evaluation.dept_code }}
            </div>
            
            <div v-if="evaluation.status === 'ACTIVE'" class="text-caption text-negative text-weight-bold q-mt-xs row items-center">
              <q-icon name="lock" class="q-mr-xs" /> System Lock: Details are read-only unless the evaluation is in DRAFT status.
            </div>
          </div>
          <q-space />
          <q-badge rounded :color="getStatusColor(evaluation.status)" class="q-px-md q-py-xs text-weight-bold">
            {{ evaluation.status }}
          </q-badge>
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
            <q-card-section class="row items-center justify-between">
              <div>
                <div class="text-subtitle1 text-weight-bold">Indicators and Evaluation Items</div>
                <div class="text-caption text-grey-6">Manage the questions and assigned authority for this evaluation.</div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section v-if="evaluation.indicators && evaluation.indicators.length" class="q-gutter-md">
              <q-card v-for="indicator in evaluation.indicators" :key="indicator._id" flat bordered>
                <q-card-section class="row items-center q-col-gutter-md bg-grey-1">
                  <div class="col-12 col-md-7">
                    <div class="text-subtitle2 text-weight-bold">{{ indicator.sort_order }}. {{ indicator.name }}</div>
                    <div class="text-caption text-grey-7">Authority: {{ indicator.assigned_role || 'Unassigned' }}</div>
                  </div>
                  <q-space />
                </q-card-section>
                <q-list separator>
                  <q-item v-for="(item, itemIndex) in indicator.items" :key="item._id">
                    <q-item-section avatar><q-avatar color="blue-grey-1" text-color="blue-grey-9" size="30px">{{ item.sort_order }}</q-avatar></q-item-section>
                    <q-item-section><q-item-label>{{ item.name }}</q-item-label></q-item-section>
                    <q-item-section side>
                      <q-btn v-if="canManageItems(indicator)" flat round dense icon="edit" color="primary" @click="openEditItem(indicator, item, itemIndex)" />
                      <q-btn v-if="canManageItems(indicator)" flat round dense icon="delete_outline" color="negative" @click="deleteItem(indicator, itemIndex)" />
                    </q-item-section>
                  </q-item>
                  <q-item v-if="!indicator.items || !indicator.items.length"><q-item-section class="text-caption text-grey-6">No evaluation items.</q-item-section></q-item>
                </q-list>
                <q-card-actions v-if="canManageItems(indicator)" align="right">
                  <q-btn flat dense color="primary" icon="playlist_add" label="Add Item" @click="openCreateItem(indicator)" />
                </q-card-actions>
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
                <q-item-section side><q-badge color="blue-grey-1" text-color="blue-grey-9">{{ member.role }}</q-badge></q-item-section>
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
export default {
  name: 'EvaluationDetailsWorkspace',

  data () {
    return {
      // Main Structural State Containers
      evaluation: null,
      loading: false,
      saving: false,
      activeTab: 'details',
      
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
      faculties: [
        {
          employeeId: 1001,
          departmentId: 10,
          employeeNumber: 'EMP-001001',
          dept_code: 'DCS',
          fullname: 'Maria Santos',
          email: 'maria.santos@msugensan.edu.ph'
        },
        {
          employeeId: 1002,
          departmentId: 10,
          employeeNumber: 'EMP-001002',
          dept_code: 'DCS',
          fullname: 'Pedro Reyes',
          email: 'pedro.reyes@msugensan.edu.ph'
        },
        {
          employeeId: 1003,
          departmentId: 20,
          employeeNumber: 'EMP-001003',
          dept_code: 'DMS',
          fullname: 'Liza Cruz',
          email: 'liza.cruz@msugensan.edu.ph'
        }
      ],
      
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

  computed: {
    isDraft () {
      return this.evaluation?.status === 'DRAFT';
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
      return this.faculties.filter(faculty => !assignedEmails.includes(String(faculty.email || '').trim().toLowerCase()));
    }
  },

  mounted () {
    this.fetchDeepEvaluationStructure();
  },

  methods: {
    canManageItems (indicator) {
      if (!this.isDraft) return false;
      const assignedRole = String(indicator?.assigned_role || '').trim().toUpperCase();
      return Boolean(assignedRole && this.currentUserRoles.includes(assignedRole)) || this.currentUserRoles.includes('admin'.toUpperCase());
    },

    openAssignMember () {
      if (!this.canAssignMembers) {
        this.$q.notify({ type: 'warning', message: 'Only a CHAIRPERSON can assign evaluation members.' });
        return;
      }
      this.memberForm = { facultyId: null, role: 'MEMBER' };
      this.memberDialog.show = true;
    },

    assignMember () {
      if (!this.canAssignMembers) {
        this.$q.notify({ type: 'warning', message: 'Only a CHAIRPERSON can assign evaluation members.' });
        return;
      }

      const faculty = this.selectedFaculty;
      if (!faculty) return;

      const facultyEmail = String(faculty.email || '').trim().toLowerCase();
      const alreadyAssigned = this.evaluation.members.some(member => String(member.email || '').trim().toLowerCase() === facultyEmail);
      if (alreadyAssigned) {
        this.$q.notify({ type: 'warning', message: `${faculty.fullname} is already assigned to this evaluation.` });
        return;
      }

      if (this.memberForm.role === 'COORDINATOR' && this.evaluation.members.some(member => member.role === 'COORDINATOR')) {
        this.$q.notify({ type: 'warning', message: 'Only one COORDINATOR can be assigned to an evaluation.' });
        return;
      }

      this.evaluation.members.push({
        _id: `member_${faculty.employeeId}`,
        employeeId: faculty.employeeId,
        departmentId: faculty.departmentId,
        employeeNumber: faculty.employeeNumber,
        dept_code: faculty.dept_code,
        fullname: faculty.fullname,
        email: faculty.email,
        role: this.memberForm.role
      });
      this.memberDialog.show = false;
      this.$q.notify({ type: 'positive', message: `${faculty.fullname} assigned successfully.` });
    },

    async fetchDeepEvaluationStructure () {
      this.loading = true;
      const targetId = this.$route.params.id;

      // Simulate API Network trip latency
      await new Promise((resolve) => {
        return setTimeout(resolve, 500);
      });

      // Hydrating fully detailed structural evaluation instance mapping
      this.evaluation = {
        _id: targetId,
        acad_year: "2026-2027",
        sem: 1,
        course_code: "CS-312",
        course_title: "Database Management Systems II",
        dept_code: "DCS",
        status: "DRAFT", // Can test changes by toggling between 'DRAFT' and 'ACTIVE'
        
        // 👥 Tab 4 - Members Mapped Profiles
        members: [
          { 
            _id: "m_01", 
            fullname: "Azarael Corpin", 
            email: "azarael.corpin@msugensan.edu.ph", 
            role: "COORDINATOR" 
          },
          { 
            _id: "m_02", 
            fullname: "John Doe", 
            email: "j.doe@msugensan.edu.ph", 
            role: "MEMBER" 
          },
          { 
            _id: "m_03", 
            fullname: "Jane Smith", 
            email: "j.smith@msugensan.edu.ph", 
            role: "MEMBER" 
          }
        ],
        
        // 📋 Tab 1 - Indicators and Nested Criteria Items
        indicators: [
          {
            _id: "ind_sample_01",
            evaluation_id: targetId,
            name: "Instructional Delivery & Mastery",
            sort_order: 1,
            assigned_role: "COORDINATOR",
            items: [
              { 
                _id: "item_sample_A", 
                indicator_id: "ind_sample_01", 
                name: "The instructor sets up index parameters explaining normalization correctly.", 
                sort_order: 1 
              },
              { 
                _id: "item_sample_B", 
                indicator_id: "ind_sample_01", 
                name: "Relates relational execution profiles back to live performance queries.", 
                sort_order: 2 
              }
            ]
          }
        ]
      };

      // 📑 Tab 2 - Action Documentation Reports List
      this.actionReports = [
        { 
          _id: "rep_01", 
          title: "Mid-Term Delivery Evaluation Report", 
          author: "Azarael Corpin", 
          status: "APPROVED" 
        },
        { 
          _id: "rep_02", 
          title: "Syllabus Compliance Checklist", 
          author: "John Doe", 
          status: "PENDING" 
        }
      ];

      // 📊 Tab 3 - Aggregated Quantitative Metric Data Averages
      this.responseStats = [
        { 
          _id: "stat_01", 
          indicator_name: "Instructional Delivery & Mastery", 
          total_respondents: 45, 
          current_average: 4.65 
        },
        { 
          _id: "stat_02", 
          indicator_name: "Overall Course Structure Alignment", 
          total_respondents: 45, 
          current_average: 4.12 
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
        indicator_id: parentIndicator._id,
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

    deleteItem (parentIndicator, index) {
      if (!this.isDraft || !this.canManageItems(parentIndicator)) {
        this.notifyStateLockout();
        return;
      }

      parentIndicator.items.splice(index, 1);
      
      this.$q.notify({ 
        type: 'info', 
        message: 'Target prompt criterion dropped.' 
      });
    },

    // --- 🛠️ Shared Form Submission Interceptor Operations ---
    handleDialogFormSubmission () {
      if (this.dialog.type === 'INDICATOR') {
        this.processIndicatorMutation();
      } else if (this.dialog.type === 'ITEM') {
        this.processItemMutation();
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

    processItemMutation () {
      const targetedIndicator = this.dialog.targetRef;
      
      if (!targetedIndicator.items) {
        targetedIndicator.items = [];
      }

      if (this.dialog.index !== null) {
        // Handle checklist sub-item item edit substitutions
        targetedIndicator.items.splice(this.dialog.index, 1, { ...this.formItem });
        this.$q.notify({ type: 'positive', message: 'Criteria questionnaire updated.' });
      } else {
        // Handle checklist sub-item creations
        this.formItem._id = 'itm_' + Date.now();
        targetedIndicator.items.push({ ...this.formItem });
        this.$q.notify({ type: 'positive', message: 'Questionnaire prompt indexed.' });
      }
    }
  }
};

</script>

<style scoped>
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
</style>
