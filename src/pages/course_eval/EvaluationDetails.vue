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
                        {{ indicator.evaluation_items?.length || 0 }} item{{ (indicator.evaluation_items?.length || 0) === 1 ? '' : 's' }}
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
                  <q-item v-for="(item, itemIndex) in indicator.evaluation_items" :key="item._id" class="evaluation-item">
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
                  <q-item v-if="!indicator.evaluation_items || !indicator.evaluation_items.length" class="empty-items">
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
          <div
            v-if="fetchSummaryStatus.loading"
            class="q-pa-xl flex column items-center justify-start"
            style="min-height: 45vh;"
          >
            <q-spinner-dots size="3.5em" color="primary" />
            <div class="text-center text-grey-6 q-mt-md text-weight-medium">
              Loading summary report...
            </div>
          </div>

          <div v-else-if="fetchSummaryStatus.error" class="q-pt-xl text-negative text-center">
            {{ fetchSummaryStatus.error }}
          </div>

          <template v-else>
            <div class="summary-panel-shell">
              <q-card flat bordered class="bg-white q-mb-md summary-sticky-legend">
                <q-card-section>
                  <div class="text-subtitle1 text-weight-bold">Rating Scale Legend</div>
                  <div class="text-caption text-grey-6 q-mb-sm">Interpretation guide used in the summary report.</div>

                  <div class="row q-col-gutter-sm">
                    <div v-for="scale in ratingScaleLegend" :key="scale._id || scale.id || scale.range" class="col-12 col-sm-6 col-md-3">
                      <q-card flat bordered class="bg-grey-1">
                        <q-card-section class="q-pa-sm">
                          <div class="text-caption text-grey-7">{{ scale.range }}</div>
                          <div class="text-weight-bold text-primary">{{ scale.label }}</div>
                          <div class="text-caption text-grey-7">{{ scale.interpretation }}</div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>

                  <div v-if="!ratingScaleLegend.length" class="text-caption text-grey-6 q-mt-sm">
                    No rating scale legend available for this evaluation.
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat bordered class="bg-white summary-table-card">
                <q-card-section class="summary-table-header">
                  <div class="text-subtitle1 text-weight-bold">Subjective Course Evaluation Summary Report</div>
                  <div class="text-caption text-grey-6">Mean, description, and interpretation by indicator.</div>
                </q-card-section>

                <q-markup-table flat separator="cell" class="summary-report-table">
                  <thead>
                    <tr>
                      <th class="text-left">Indicators</th>
                      <th class="text-right">Mean</th>
                      <th class="text-right">Description</th>
                      <th class="text-right">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(row, index) in summaryDisplayRows" :key="`${row.indicatorKey || 'indicator'}-${row.itemKey || 'row'}-${index}`">
                      <tr v-if="row.isHeader" class="summary-header-row">
                        <td colspan="4" class="text-left text-weight-bold">
                          {{ row.label }}
                        </td>
                      </tr>
                      <tr v-else-if="row.isOverallSpacer" class="summary-overall-spacer-row">
                        <td colspan="4"></td>
                      </tr>
                      <tr v-else-if="row.isOverallFooter" class="summary-overall-footer-row">
                        <td class="text-left summary-item-name text-weight-bold">{{ row.label }}</td>
                        <td class="text-right summary-metric text-weight-bold">{{ formatSummaryMean(row.mean) }}</td>
                        <td class="text-right summary-description text-weight-bold">{{ row.description }}</td>
                        <td class="text-right summary-interpretation text-weight-bold">{{ row.interpretation }}</td>
                      </tr>
                      <tr v-else-if="row.label === 'Total Average'" class="summary-total-average-row">
                        <td class="text-left summary-item-name text-weight-bold">{{ row.label }}</td>
                        <td class="text-right summary-metric text-weight-bold">{{ formatSummaryMean(row.mean) }}</td>
                        <td class="text-right summary-description text-weight-bold">{{ row.description }}</td>
                        <td class="text-right summary-interpretation text-weight-bold">{{ row.interpretation }}</td>
                      </tr>
                      <tr v-else>
                        <td class="text-left summary-item-name">{{ row.label }}</td>
                        <td class="text-right summary-metric">{{ formatSummaryMean(row.mean) }}</td>
                        <td class="text-right summary-description">{{ row.description }}</td>
                        <td class="text-right summary-interpretation">{{ row.interpretation }}</td>
                      </tr>
                    </template>

                    <tr v-if="!summaryDisplayRows.length">
                      <td colspan="4" class="text-center text-grey-6">No response summary available.</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </q-card>
            </div>
          </template>
        </q-tab-panel>

        <q-tab-panel name="action-report" class="q-pa-none">
          <q-card flat bordered class="bg-white">
            <q-card-section class="q-pb-xl">
              <div class="text-subtitle1 text-weight-bold">Action Report by Indicator</div>
              <div class="text-caption text-grey-6">Review the significantly lowest-rated item(s), then record remarks and the required action.</div>
            </q-card-section>
            <q-separator />

            <q-card-section class="action-report-table-header row q-col-gutter-lg text-caption text-weight-bold text-grey-7">
              <div class="col-12 col-md-6">Remarks</div>
              <div class="col-12 col-md-6">Action</div>
            </q-card-section>

            <q-list separator>
              <q-item v-for="indicator in evaluation.indicators" :key="indicator._id" class="action-report-row q-py-lg">
                <q-item-section class="col-12">
                  <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-md">
                    {{ indicator.indicator_name || indicator.name || 'Indicator' }}
                  </div>

                  <div class="row q-col-gutter-lg">
                    <div class="col-12 col-md-6 action-report-column">
                      <div class="lowest-rated-panel q-mb-md">
                        <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">Significantly Lowest Rated Item/s</div>
                        <template v-if="lowestRatedItemsFor(indicator).length">
                          <div v-for="item in lowestRatedItemsFor(indicator)" :key="item._id || item.item_id || item.name" class="row items-start no-wrap q-mb-xs">
                            <q-icon name="priority_high" color="negative" size="18px" class="q-mr-xs q-mt-xs" />
                            <div class="text-body2 text-grey-8">
                              {{ item.name || item.item_name || 'Unnamed item' }}
                              <span class="text-caption text-negative text-weight-bold q-ml-xs">({{ formatSummaryMean(item.mean) }})</span>
                            </div>
                          </div>
                        </template>
                        <div v-else class="text-caption text-grey-6">No item averages available.</div>
                      </div>
                      <div class="comments-panel">
                        <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">Remarks</div>
                        <div v-if="commentsForIndicator(indicator).length" class="comments-list">
                          <div v-for="(comment, commentIndex) in commentsForIndicator(indicator)" :key="`${indicator._id}-comment-${commentIndex}`" class="comment-entry text-body2 text-grey-8">
                            {{ comment }}
                          </div>
                        </div>
                        <div v-else class="text-caption text-grey-6">No comments recorded for this indicator.</div>
                      </div>
                    </div>

                    <div class="col-12 col-md-6 action-report-column">
                      <q-input
                        :model-value="actionReportFor(indicator).action"
                        type="textarea"
                        outlined
                        label="Action"
                        class="action-input"
                        :disable="!canEditActionReport"
                        @update:model-value="value => updateActionReport(indicator, 'action', value)"
                      />
                    </div>
                  </div>

                  <div class="row justify-end q-mt-md">
                    <q-btn icon="save" label="Save report" unelevated color="primary" no-caps :disable="!canEditActionReport" @click="saveActionReport(indicator)" />
                  </div>
                </q-item-section>
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
      fetchSummaryStatus: { loading: false, error: null },

      // Dynamic Component Data Pools
      actionReports: [],
      responseStats: [],
      ratingScaleProfile: null,

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
        evaluation_items: []
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

    canEditActionReport () {
      return this.isDraft || this.evaluation?.status === 'CLOSED';
    },

    totalEvaluationItems () {
      return (this.evaluation?.indicators || []).reduce(
        (total, indicator) => total + (indicator.evaluation_items?.length || 0),
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

    ratingScaleLegend () {
      const items = this.ratingScaleProfile?.items || this.ratingScaleProfile?.scale_items || [];

      return [...items]
        .map((item) => {
          const min = Number(item.min_value ?? item.minValue ?? 0);
          const max = Number(item.max_value ?? item.maxValue ?? 0);

          return {
            ...item,
            min,
            max,
            range: min === max ? Number(min).toFixed(2) : `${Number(min).toFixed(2)}–${Number(max).toFixed(2)}`,
            label: item.description || item.label || `${Number(min).toFixed(2)}–${Number(max).toFixed(2)}`,
            interpretation: item.interpretation || item.meaning || 'N/A'
          };
        })
        .sort((first, second) => (first.min ?? 0) - (second.min ?? 0));
    },

    summaryDisplayRows () {
      const rows = [];
      const overallFooterRows = [];

      const buildMeanDescription = (value) => {
        const numeric = Number(value);
        const safeValue = Number.isFinite(numeric) ? numeric : 0;

        if (safeValue >= 3.5) return { description: 'Strongly Agree', interpretation: 'Very Satisfied' };
        if (safeValue >= 2.5) return { description: 'Agree', interpretation: 'Satisfied' };
        if (safeValue >= 1.5) return { description: 'Disagree', interpretation: 'Dissatisfied' };
        return { description: 'Strongly Disagree', interpretation: 'Very Dissatisfied' };
      };

      const getIndicatorAverage = (indicator) => {
        const items = Array.isArray(indicator?.evaluation_items) ? indicator.evaluation_items : [];
        if (!items.length) return 0;

        const total = items.reduce((sum, item) => sum + Number(item.mean ?? item.rating ?? item.value ?? 0), 0);
        return items.length ? total / items.length : 0;
      };

      // Response statistics are item-level records. The evaluation structure is
      // the authoritative source for the complete indicator and item list.
      const sourceStats = this.evaluation?.indicators || [];

      sourceStats.forEach((stat, statIndex) => {
        const indicatorName = stat.indicator_name || stat.name || stat.label || 'Indicator';
        const normalizedName = String(indicatorName).trim();
        const indicatorKey = stat._id || stat.indicator_id || `${indicatorName}-${statIndex}`;
        const isOverallIndicator = normalizedName.toLowerCase() === 'overall';

        const indicatorAverage = stat.mean ?? stat.current_average ?? stat.average ?? getIndicatorAverage(stat);
        const averageMeta = buildMeanDescription(indicatorAverage);

        if (isOverallIndicator) {
          const overallItems = Array.isArray(stat.evaluation_items) && stat.evaluation_items.length
            ? stat.evaluation_items
            : [{
                name: 'Overall',
                mean: indicatorAverage,
                description: averageMeta.description,
                interpretation: averageMeta.interpretation,
                _id: `${indicatorKey}-overall`
              }];

          overallItems.forEach((item, itemIndex) => {
            const itemMean = Number(item.mean ?? item.rating ?? item.value ?? item.score ?? indicatorAverage ?? 0);
            const itemMeta = buildMeanDescription(itemMean);

            overallFooterRows.push({
              isHeader: false,
              isOverallFooter: true,
              label: item.name || item.item_name || item.label || 'Overall',
              mean: itemMean,
              description: item.description || itemMeta.description,
              interpretation: item.interpretation || itemMeta.interpretation,
              itemKey: item._id || item.item_id || `${indicatorKey}-overall-${itemIndex}`
            });
          });
          return;
        }

        rows.push({
          isHeader: true,
          label: `${this.getIndicatorPrefix(statIndex + 1)} ${indicatorName}`,
          indicatorKey,
          mean: indicatorAverage,
          description: averageMeta.description,
          interpretation: averageMeta.interpretation
        });

        const items = Array.isArray(stat.evaluation_items) && stat.evaluation_items.length
          ? stat.evaluation_items
          : (Array.isArray(this.evaluation?.indicators?.[statIndex]?.evaluation_items)
            ? this.evaluation.indicators[statIndex].evaluation_items
            : []);

        if (items.length) {
          items.forEach((item, itemIndex) => {
            const itemMean = Number(item.mean ?? item.rating ?? item.value ?? item.score ?? 0);
            const itemMeta = buildMeanDescription(itemMean);
            
            rows.push({
              isHeader: false,
              label: item.name || item.item_name || item.label || `Item ${itemIndex + 1}`,
              mean: itemMean,
              description: itemMeta.description,
              interpretation: itemMeta.interpretation,
              itemKey: item._id || item.item_id || `${indicatorKey}-${itemIndex}`
            });
          });
        }

        rows.push({
          isHeader: false,
          label: 'Average',
          mean: Number(indicatorAverage),
          description: averageMeta.description,
          interpretation: averageMeta.interpretation,
          itemKey: `${indicatorKey}-average`
        });
      });

      const indicatorAverages = sourceStats
        .filter((stat) => {
          const indicatorName = stat.indicator_name || stat.name || stat.label || 'Indicator';
          return String(indicatorName).trim().toLowerCase() !== 'overall';
        })
        .map((stat) => Number(stat.mean ?? stat.current_average ?? stat.average ?? getIndicatorAverage(stat)))
        .filter((value) => Number.isFinite(value));

      if (indicatorAverages.length) {
        const totalAverage = indicatorAverages.reduce((sum, value) => sum + value, 0) / indicatorAverages.length;
        const totalAverageMeta = buildMeanDescription(totalAverage);

        rows.push({
          isHeader: false,
          label: 'Total Average',
          mean: Number(totalAverage),
          description: totalAverageMeta.description,
          interpretation: totalAverageMeta.interpretation,
          itemKey: 'total-average'
        });

        if (overallFooterRows.length) {
          rows.push({
            isHeader: false,
            isOverallSpacer: true,
            label: '',
            mean: null,
            description: '',
            interpretation: '',
            itemKey: 'overall-spacer'
          });
          rows.push(...overallFooterRows);
        }
      }

      return rows;
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
        this.actionReports = (details.actionReports || details.action_reports || [])
          .map(report => ({
            indicator_id: report.indicator_id,
            action: report.action || ''
          }))
          .filter(report => report.indicator_id !== undefined && report.indicator_id !== null);
        this.getResponseStats();
        this.getCommentsByEvaluationId();
        this.fetchEvaluationMembers();
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

    async getResponseStats () {
      this.fetchSummaryStatus.loading = true;
      const targetId = this.$route.params.id;

      if (!targetId) {
        throw new Error('Evaluation id is required.');
      }

      try {
        if(this.evaluation.status === 'DRAFT') {
          this.responseStats = [];
          this.fetchSummaryStatus.loading = false;
          this.fetchSummaryStatus.error = 'Summary statistics are only available for evaluations that are not in DRAFT status.';
          return;
        }
        const response = await api.getResponseStatistics(targetId);

        if (!response || response.error || !response.success) {
          throw new Error(response?.error?.response?.data?.message || 'Unable to load evaluation response statistics.');
        }

        const ratingScaleResp = await api.getRatingScaleProfileById(this.evaluation.rating_scale_id);
        if (!ratingScaleResp || ratingScaleResp.error || !ratingScaleResp.success) {
          throw new Error(ratingScaleResp?.error?.response?.data?.message || 'Unable to load rating scale details.');
        }
        this.ratingScaleProfile = ratingScaleResp.data || null;
        const ratingScaleDetails = ratingScaleResp.data;

        let responseStatistics = Array.isArray(response.data) ? response.data : [];
        //loop the evaluation indicators and match the response statistics by evalution_item_id inside the indicator items
        for (const indicator of this.evaluation.indicators) {
          for (const evaluation_item of indicator.evaluation_items) {
            const itemKey = evaluation_item.item_id;
            const matchingStat = responseStatistics.find(stat => String(stat.evaluation_item_id) === String(itemKey));
            if (matchingStat) {
              evaluation_item._id = evaluation_item._id || matchingStat.evaluation_item_id || evaluation_item.item_id;
              evaluation_item.mean = matchingStat.average_rating;
              evaluation_item.total_responses = matchingStat.total_responses;
              //get the description and interpretation from the rating scale details (in between the min and max values of the rating scale)
              const ratingScaleItem = ratingScaleDetails.items.find(item => matchingStat.average_rating >= item.min_value && matchingStat.average_rating <= item.max_value);
              if (ratingScaleItem) {
                evaluation_item.description = ratingScaleItem.description;
                evaluation_item.interpretation = ratingScaleItem.interpretation;
              }
            }
          }
        }
      } catch (error) {
        this.responseStats = [];
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Failed to load evaluation response statistics.'
        });
        this.fetchSummaryStatus.error = error.message || 'Failed to load evaluation response statistics.';
      } finally {
        this.fetchSummaryStatus.loading = false;
      }
    },

    async getCommentsByEvaluationId () {
      try {
        const response = await api.getCommentsByEvaluationId(this.evaluation._id);
        if (!response || response.error || !response.success) {
          throw new Error(response?.error?.response?.data?.message || 'Unable to load evaluation comments.');
        }
        const comments = Array.isArray(response.data) ? response.data : [];
        for(const indicator of this.evaluation.indicators) {
          const matchingComment = comments.find(comment => String(comment.indicator_id) === String(indicator.indicator_id));
          indicator.comments = matchingComment?.comments ?? matchingComment?.comment ?? matchingComment?.text ?? null;
        }
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Failed to load evaluation comments.'
        });
        
      }
    },

    normalizeEvaluationDetails (details) {
      const indicators = details.indicators || details.evaluation_indicators || [];
      const evaluationItems = details.evaluation_items || details.evaluationItems || [];

      return {
        ...details,
        indicators: indicators.map((indicator) => {
          const indicatorItems = [indicator.evaluation_items, indicator.items, indicator.evaluationItems]
            .find(Array.isArray) || [];
          const indicatorId = indicator._id || indicator.id || indicator.indicator_id;
          const relatedItems = evaluationItems.filter((item) => {
            const itemIndicatorId = item.indicator_id || item.indicatorId || item.indicator_id_fk;
            return String(itemIndicatorId) === String(indicatorId);
          });
          const items = [...indicatorItems, ...relatedItems].filter((item, index, allItems) => {
            const itemId = item._id || item.id || item.item_id;
            return allItems.findIndex(candidate => String(candidate._id || candidate.id || candidate.item_id) === String(itemId)) === index;
          });

          return {
            ...indicator,
            evaluation_items: items.map((item, index) => ({
              ...item,
              _id: item._id || item.id || item.item_id || `${indicator._id || indicator.id || 'indicator'}-${index + 1}`,
              item_id: item.item_id || item.id || item._id || null,
              sort_order: item.sort_order || item.sortOrder || index + 1,
              name: item.name || item.item_name || item.itemName || item.question || 'Unnamed evaluation item'
            })).sort((firstItem, secondItem) => Number(firstItem.sort_order) - Number(secondItem.sort_order))
          };
        })
      };
    },

    getIndicatorPrefix (index) {
      const prefixes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      return prefixes[(index - 1)] || ` ${index}.`;
    },

    formatSummaryMean (value) {
      if (value === null || value === undefined || value === '') return '—';
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return value;
      return numeric.toFixed(2);
    },

    lowestRatedItemsFor (indicator) {
      const items = Array.isArray(indicator?.evaluation_items) ? indicator.evaluation_items : [];
      const ratedItems = items
        .map((item) => {
          const mean = Number(item.mean ?? item.average_rating ?? item.average ?? item.rating ?? item.value);
          return Number.isFinite(mean) ? { ...item, mean } : null;
        })
        .filter(Boolean);

      if (!ratedItems.length) return [];

      const lowestMean = Math.min(...ratedItems.map(item => item.mean));
      return ratedItems.filter(item => Math.abs(item.mean - lowestMean) < 0.0001);
    },

    commentsForIndicator (indicator) {
      const source = indicator?.comments ?? indicator?.comment ?? [];
      const comments = Array.isArray(source) ? source : [source];

      return comments
        .map(comment => {
          if (comment && typeof comment === 'object') {
            return comment.comments ?? comment.comment ?? comment.text ?? '';
          }
          return comment;
        })
        .map(comment => String(comment || '').trim())
        .filter(Boolean);
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
      const indicatorId = indicator.indicator_id || indicator._id || indicator.id;
      let report = this.actionReports.find(item => String(item.indicator_id) === String(indicatorId));
      if (!report) {
        report = { indicator_id: indicatorId, action: '' };
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
        sort_order: (parentIndicator.evaluation_items?.length || 0) + 1
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

      const item = parentIndicator.evaluation_items[index];
      const confirmed = await this.confirmItemAction('Are you sure you want to delete this evaluation item?');
      if (!confirmed) return;

      this.saving = true;

      try {
        const response = await api.deleteEvaluationItem(item._id);
        if (!response || response.error || !response.success) {
          throw new Error(response?.error?.response?.data?.message || 'Failed to delete evaluation item.');
        }

        parentIndicator.evaluation_items.splice(index, 1);
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
      const items = targetedIndicator.evaluation_items || [];
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
      targetedIndicator.evaluation_items = items;

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
          targetedIndicator.evaluation_items.splice(this.dialog.index, 1, savedItem);
        } else {
          targetedIndicator.evaluation_items.push(savedItem);
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
      indicator.evaluation_items.sort((firstItem, secondItem) => {
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
.summary-panel-shell {
  max-height: calc(100vh - 240px);
  overflow-y: auto;
  position: relative;
}

.summary-sticky-legend {
  position: sticky;
  top: 0;
  z-index: 6;
  background: #fff;
}

.summary-table-card {
  position: relative;
}

.summary-table-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.summary-report-table {
  width: 100%;
  overflow-x: auto;
}

.summary-report-table :deep(.q-table) {
  width: 100%;
  min-width: 0;
  table-layout: fixed;
}

.summary-report-table th,
.summary-report-table td {
  white-space: normal;
  overflow-wrap: anywhere;
  vertical-align: top;
}

.summary-report-table th:nth-child(1),
.summary-report-table td:nth-child(1) {
  width: 46%;
}

.summary-report-table th:nth-child(2),
.summary-report-table td:nth-child(2) {
  width: 14%;
}

.summary-report-table th:nth-child(3),
.summary-report-table td:nth-child(3) {
  width: 19%;
}

.summary-report-table th:nth-child(4),
.summary-report-table td:nth-child(4) {
  width: 21%;
}

.summary-report-table thead th {
  background: #fff;
}

.summary-total-average-row {
  border-top: 2px solid #dbe2ea;
  box-shadow: inset 0 1px 0 rgba(15, 23, 42, 0.02);
}

.summary-overall-spacer-row td {
  height: 12px;
  border: none;
  background: transparent;
  padding: 0;
}

.summary-overall-footer-row {
  border-top: 1px solid #e5e7eb;
}

.summary-overall-footer-row td {
  padding-top: 12px;
}

@media (max-width: 600px) {
  .summary-report-table {
    display: block;
    overflow-x: hidden;
  }

  .summary-report-table thead {
    display: none;
  }

  .summary-report-table tbody,
  .summary-report-table tr,
  .summary-report-table td {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  .summary-report-table tbody {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .summary-report-table tr {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
    padding: 10px 12px;
  }

  .summary-report-table td {
    border: none !important;
    padding: 6px 0;
    text-align: left !important;
  }

  .summary-report-table .summary-item-name {
    font-weight: 700;
    font-size: 0.95rem;
    padding-bottom: 8px;
  }

  .summary-report-table .summary-metric,
  .summary-report-table .summary-description,
  .summary-report-table .summary-interpretation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .summary-report-table .summary-metric::before {
    content: 'Mean';
    color: #6b7280;
    font-weight: 600;
  }

  .summary-report-table .summary-description::before {
    content: 'Description';
    color: #6b7280;
    font-weight: 600;
  }

  .summary-report-table .summary-interpretation::before {
    content: 'Interpretation';
    color: #6b7280;
    font-weight: 600;
  }

  .summary-total-average-row {
    border-top: 2px solid #dbe2ea;
    box-shadow: inset 0 1px 0 rgba(15, 23, 42, 0.02);
  }

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
.action-report-table-header {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;
}
.action-report-row {
  display: block;
}
.action-report-column {
  display: flex;
  flex-direction: column;
}
.comments-panel,
.action-input {
  flex: 1 1 auto;
}
.comments-panel {
  min-height: 128px;
  padding: 12px;
  border: 1px solid #dfe5ee;
  border-radius: 6px;
  background: #ffffff;
}
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.comment-entry {
  padding: 8px 10px;
  border-left: 3px solid #90a4ae;
  background: #f8fafc;
  white-space: pre-wrap;
}
.action-input {
  min-height: 128px;
}
.action-input :deep(.q-field__control),
.action-input :deep(.q-field__native) {
  height: 100%;
  min-height: 128px;
}
.lowest-rated-panel {
  min-height: 74px;
  padding: 10px 12px;
  border-left: 4px solid #c62828;
  border-radius: 6px;
  background: #fff7f7;
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
</style>
