<template>
  <q-page padding class="row q-col-gutter-md">
    
    <!-- ======================================================================= -->
    <!-- 📄 LEFT PANEL: MASTER EVALUATIONS LIST                                  -->
    <!-- ======================================================================= -->
    <div class="col-12 col-md-4">
      <q-card outlined class="full-height-card shadow-1">
        <q-card-section class="row justify-between items-center bg-primary text-white">
          <div class="text-h6">Evaluations</div>
          <q-btn label="New" icon="add" color="secondary" dense padding="xs md" @click="openEvaluationForm(null)" />
        </q-card-section>

        <!-- Empty State Fallback -->
        <q-card-section v-if="evaluations.length === 0" class="text-center text-grey-6 q-pa-xl">
          <q-icon name="layer_clear" size="md" class="q-mb-sm" />
          <div>No evaluation instruments configured yet.</div>
        </q-card-section>

        <!-- Evaluation List Grid -->
        <q-list v-else separator class="q-pa-none">
          <q-item 
            v-for="evalRow in evaluations" 
            :key="evalRow._id" 
            clickable 
            :active="selectedEval?._id === evalRow._id"
            active-class="bg-blue-1 text-primary text-weight-bold"
            @click="selectEvaluation(evalRow)"
          >
            <q-item-section>
              <q-item-label class="text-subtitle1">{{ evalRow.name || 'Untitled Template' }}</q-item-label>
              <q-item-label caption class="row items-center q-gutter-x-sm q-mt-xs">
                <q-chip 
                  :color="evalRow.status === 'ACTIVE' ? 'positive' : 'negative'" 
                  text-color="white" 
                  size="xs" 
                  dense
                  :label="evalRow.status" 
                />
                <span class="q-ml-sm">Type: {{ evalRow.type || 'Unknown' }}</span>
                <span>Scale ID: {{ ratingScales.find(s => s._id === evalRow.rating_scale_id)?.name || 'Unknown' }}</span>
              </q-item-label>
            </q-item-section>
            
            <q-item-section side>
              <q-btn icon="edit" flat round dense color="grey-7" @click.stop="openEvaluationForm(evalRow)" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <!-- ======================================================================= -->
    <!-- 📊 RIGHT PANEL: NESTED STRUCTURE (INDICATORS & ITEMS)                  -->
    <!-- ======================================================================= -->
    <div class="col-12 col-md-8">
      <!-- State A: Default View before selection -->
      <q-card v-if="!selectedEval" flat bordered class="bg-grey-1 flex flex-center full-height-card">
        <div class="text-center text-grey-6 q-pa-xl">
          <q-icon name="assignment" size="xl" class="q-mb-sm" />
          <div class="text-subtitle1">Select an evaluation from the list to manage indicators and criteria items.</div>
        </div>
      </q-card>

      <!-- State B: Active Structural Management View -->
      <q-card v-else outlined class="shadow-1">
        <q-card-section class="row justify-between items-center bg-grey-3 text-grey-9">
          <div>
            <span class="text-weight-bold text-subtitle1">Workspace:</span>
            <span class="text-primary text-subtitle1 text-weight-medium q-ml-xs">{{ selectedEval.name }}</span>
          </div>
          <q-btn label="Add Indicator" icon="add_box" color="secondary" size="sm" @click="addIndicator" />
        </q-card-section>

        <!-- Nested Configuration Grid -->
        <q-card-section v-if="indicators.length === 0" class="text-center text-grey-6 q-pa-xl">
          This evaluation profile has no indicators. Click "Add Indicator" to build sections.
        </q-card-section>
        <!-- scrollable container -->
         <div v-else ref="workspaceScroll"  style="max-height: 75vh; overflow-y: auto;">
        <q-card-section class="q-gutter-y-lg q-pa-md">
          <q-card 
            v-for="(ind, indIdx) in indicators" 
            :key="indIdx" 
            bordered 
            flat 
            class="bg-grey-1 border-indicator rounded-borders"
          >
            <!-- 🔶 LEVEL 1: INDICATOR ENTRY HEADER -->
            <q-card-section class="bg-white row q-col-gutter-sm items-center q-py-sm border-bottom">
              <q-input v-model="ind.name" label="Indicator Heading *" dense outlined class="col-12 col-sm-5" :rules="[val => !!val || 'Required']" />
              
              <!-- 🔐 Updated Context: Managing Authority Selection Dropdown -->
              <q-select 
                v-model="ind.assigned_role" 
                :options="roleOptions" 
                label="Managing Authority / Role *" 
                dense 
                outlined 
                class="col-12 col-sm-3" 
                hint="Role authorized to edit this indicator group"
              />
                <q-input 
                v-model.number="ind.sort_order" 
                type="number" 
                label="Sort *" 
                dense 
                outlined 
                class="col-6 col-sm-1" 
                :rules="[val => val !== null && val !== '' || '']" 
                />
              
              <q-toggle v-model="ind.status" true-value="ACTIVE" false-value="INACTIVE" checked-icon="check" color="green" unchecked-icon="clear" class="col-6 col-sm-2 justify-center" label="Active" />
              
              <div class="col-12 col-sm-1 text-right">
                <q-btn icon="delete" color="negative" flat round dense @click="removeIndicator(indIdx)" />
              </div>
            </q-card-section>

            <!-- 🔷 LEVEL 2: EVALUATION ITEMS (Nested Questions Grid Loop) -->
            <q-card-section class="q-pa-md bg-white">
              <div class="row justify-between items-center q-mb-md">
                <div class="text-caption text-weight-bold text-grey-7">CRITERIA / QUESTIONS (EVALUATION ITEMS)</div>
                <q-btn label="Add Question Item" icon="playlist_add" color="indigo-7" flat dense size="xs" :disable="!canEditIndicator(ind)" @click="addItem(indIdx)" />
              </div>

              <div v-if="ind.items.length === 0" class="text-center text-grey-5 q-pa-sm text-caption bg-grey-2 rounded-borders">
                No question items mapped to this criteria category.
              </div>

              <!-- Item Matrix Columns -->
              <div v-else class="q-gutter-y-sm">
                <div 
                  v-for="(item, itemIdx) in ind.items" 
                  :key="itemIdx" 
                  :ref="el => setItemRowRef(indIdx, itemIdx, el)"
                  class="row q-col-gutter-sm items-start q-pa-xs border-item rounded-borders bg-blue-grey-1"
                >
                  <q-input :ref="el => setItemInputRef(indIdx, itemIdx, el)" v-model="item.name" label="Question Text Description *" dense outlined class="col-12 col-sm-7" :readonly="!canEditIndicator(ind)" :rules="[val => !!val || 'Required']" />
                  
                  <q-input 
                    v-model.number="item.sort_order" 
                    type="number" 
                    label="Order *" 
                    dense 
                    outlined 
                    class="col-4 col-sm-1" 
                    :readonly="!canEditIndicator(ind)"
                    :rules="[val => val !== null && val !== '' || '']" 
                  />
                  
                  <q-toggle 
                    v-model="item.status" 
                    true-value="ACTIVE" 
                    false-value="INACTIVE" 
                    color="green" 
                    class="col-6 col-sm-3 justify-center" 
                    :disable="!canEditIndicator(ind)"
                    label="Active Status" 
                  />

                  <div class="col-2 col-sm-1 text-center q-pt-xs">
                    <q-btn icon="delete_outline" color="red-8" flat round dense size="sm" :disable="!canEditIndicator(ind)" @click="removeItem(indIdx, itemIdx)" />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>
        </div>
        <!-- UI Operational Footer -->
        <q-card-section class="row justify-end q-gutter-x-sm bg-grey-2">
          <q-btn label="Reset Layout" color="grey" flat @click="selectEvaluation(selectedEval)" />
          <q-btn label="Save Workspace Structure" icon="save" color="primary" @click="saveStructure" />
        </q-card-section>
      </q-card>
    </div>

    <!-- ======================================================================= -->
    <!-- 📄 MODAL DIALOG: EVALUATION MANAGEMENT CREATION FORM                   -->
    <!-- ======================================================================= -->
    <q-dialog v-model="evalDialog.isOpen" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white text-subtitle1 text-weight-bold">
          {{ evalDialog.isEdit ? 'Edit Evaluation Basics' : 'Instantiate New Template' }}
        </q-card-section>

        <q-card-section class="q-gutter-y-md q-pt-md">
          <q-input v-model="evalDialog.form.name" label="Evaluation Instrument Name *" outlined dense :rules="[val => !!val || 'Required']" />
          <!-- <q-input v-model.number="evalDialog.form.rating_scale_id" type="number" label="Target Rating Scale ID *" outlined dense /> -->
           <!-- select for type COURSE_EVAL or PROGRAM_EVAL -->
            <q-select 
            v-model="evalDialog.form.type"
            :options="['COURSE_EVAL', 'PROGRAM_EVAL']"
            label="Evaluation Type *"
            outlined
            dense
          />
           <q-select 
            v-model="evalDialog.form.rating_scale_id" 
            :options="ratingScales.map(scale => ({ label: scale.name, value: scale._id }))" 
            label="Target Rating Scale *" 
            outlined 
            dense 
            :rules="[val => !!val || 'Required']"
          />
          <q-select v-model="evalDialog.form.status" :options="['ACTIVE', 'INACTIVE']" label="Operational Status *" outlined dense />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Apply Changes" @click="saveEvaluationBasics" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>


<script>
import api from 'src/API/api.js';
import myDialog from 'src/plugins/myDialog.js';

export default {
  name: 'EvaluationWorkspace',

  data () {
    return {
      // Tracks the currently clicked/active evaluation master record
      selectedEval: null,

      // Options for the indicator audience constraint selector dropdown
      roleOptions: ['VCAA', 'CHAIRPERSON', 'COORDINATOR'],
      
      // Simulated Master database list array data elements
      evaluations: [
        { _id: '10', name: 'Faculty Performance Evaluation', rating_scale_id: 1, status: 'ACTIVE', type: 'COURSE_EVAL' },
        { _id: '20', name: 'Dean Peer Review Checklist', rating_scale_id: 2, status: 'INACTIVE', type: 'PROGRAM_EVAL' }
      ],
      
      // Reactive layout memory container holding loaded indicators and items
      indicators: [],
      itemRowRefs: {},
      itemInputRefs: {},

      // Modal Dialog state management framework tracking data
      evalDialog: {
        isOpen: false,
        isEdit: false,
        form: { 
          _id: null, 
          name: '', 
          rating_scale_id: null, 
          status: 'INACTIVE',
          type: 'COURSE_EVAL'
        }
      },

      // Placeholder for list of rating scales fetched from the API 
        ratingScales: []
    }
  },

    computed: {
      currentUserRoles () {
        const storedRoles = localStorage.getItem('userRoles');
        if (!storedRoles) return [];

        let roles;
        try {
          roles = JSON.parse(storedRoles);
        } catch (err) {
          roles = storedRoles;
        }

        if (typeof roles === 'string') {
          try {
            roles = JSON.parse(roles);
          } catch (err) {
            roles = roles.replace(/^\[|\]$/g, '').split(',');
          }
        }

        return (Array.isArray(roles) ? roles : [roles])
          .filter(Boolean)
          .map(role => String(role).trim().toUpperCase());
      }
    },

  methods: {
    setItemRowRef (indIdx, itemIdx, element) {
      if (element) this.itemRowRefs[`${indIdx}-${itemIdx}`] = element;
      else delete this.itemRowRefs[`${indIdx}-${itemIdx}`];
    },

    setItemInputRef (indIdx, itemIdx, input) {
      if (input) this.itemInputRefs[`${indIdx}-${itemIdx}`] = input;
      else delete this.itemInputRefs[`${indIdx}-${itemIdx}`];
    },

      canEditIndicator (indicator) {
        const assignedRole = String(indicator?.assigned_role || '').trim().toUpperCase();
        return Boolean(assignedRole && this.currentUserRoles.includes(assignedRole))|| this.currentUserRoles.includes('admin'.toUpperCase());
      },

    // Select an evaluation and mock loading its children indicators and items
    async selectEvaluation (evalRow) {
      this.selectedEval = evalRow;
      
      
      // In production, execute an integrated API call using back-end route queries:
      // api.getEvaluationStructure(evalRow._id).then(res => { this.indicators = res.data })
    //   this.indicators = [
    //     {
    //       _id: '500',
    //       evaluation_id: evalRow._id,
    //       name: 'Instructional Delivery & Classroom Control',
    //       sort_order: 1,
    //       assigned_role: 'VCAA',
    //       status: 'ACTIVE',
    //       items: [
    //         { _id: '5001', indicator_id: '500', name: 'Starts class sessions exactly on schedule.', sort_order: 1, status: 'ACTIVE' },
    //         { _id: '5002', indicator_id: '500', name: 'Demonstrates deep topical command over session syllabi.', sort_order: 2, status: 'ACTIVE' }
    //       ]
    //     },
    //     {
    //       _id: '500',
    //       evaluation_id: evalRow._id,
    //       name: 'Instructional Delivery & Classroom Control',
    //       sort_order: 1,
    //       assigned_role: 'VCAA',
    //       status: 'ACTIVE',
    //       items: [
    //         { _id: '5001', indicator_id: '500', name: 'Starts class sessions exactly on schedule.', sort_order: 1, status: 'ACTIVE' },
    //         { _id: '5002', indicator_id: '500', name: 'Demonstrates deep topical command over session syllabi.', sort_order: 2, status: 'ACTIVE' }
    //       ]
    //     }
    //   ];
      await this.getIndicatorsByEvaluationId(parseInt(evalRow._id));
    },

    async getIndicatorsByEvaluationId (evalId) {
      try{
        let response = await api.getEvaluationTemplateProfile(evalId);
     
        if (response && response.data) {
          this.indicators = Object.values(response.data);
        } else {
          myDialog.negative(this.$q, 'Error', 'Failed to load indicators. No data returned from API.');
        }
      }catch(err){
        console.error('Error fetching indicators:', err);
        myDialog.negative(this.$q, 'Error', 'Failed to load indicators. Please try again later.');
      }
    },

    // UI Dialog Trigger logic tracking
    openEvaluationForm (evalRow) {
      if (evalRow) {
        this.evalDialog.isEdit = true;
        this.evalDialog.form = { ...evalRow };
       
            let x = this.ratingScales.find(scale => scale._id === evalRow.rating_scale_id) || null; 
            if (x) this.evalDialog.form.rating_scale_id = { label: x.name, value: x._id }; 
            else this.evalDialog.form.rating_scale_id = null;

      } else {
        this.evalDialog.isEdit = false;
        this.evalDialog.form = { _id: String(Date.now()), name: '', 
        rating_scale_id: null, status: 'INACTIVE',type: 'COURSE_EVAL'};
      }
      this.evalDialog.isOpen = true;
    },

   async saveEvaluationBasics () {
      if (!this.evalDialog.form.name || !this.evalDialog.form.rating_scale_id || !this.evalDialog.form.type) {
        myDialog.negative(this.$q, 'Validation Error', 'Please fill in all required fields before saving.');
        return;
      }

      if (this.evalDialog.form.status === 'ACTIVE' && this.hasActiveEvaluationOfType(this.evalDialog.form.type, this.evalDialog.form._id)) {
        myDialog.negative(this.$q, 'Validation Error', 'Only one ACTIVE evaluation is allowed per evaluation type.');
        return;
      }

      const confirm = await myDialog.confirm(this.$q, 'Confirm Save', 'Are you sure you want to save this evaluation instrument?');
      if (!confirm) return;

      if (this.evalDialog.isEdit) {
        try {
            let tmpEval = { ...this.evalDialog.form };
            tmpEval.rating_scale_id = parseInt(this.evalDialog.form.rating_scale_id.value);
          const response = await api.updateEvaluationTemplate(tmpEval);
          if (response && response.data) {
            const index = this.evaluations.findIndex(e => e._id === tmpEval._id);
            if (index !== -1) this.evaluations.splice(index, 1, response.data);
            if (this.selectedEval && this.selectedEval._id === tmpEval._id) {
              this.selectedEval = response.data;
            }
            myDialog.positive(this.$q, 'Success', 'Evaluation instrument updated successfully.');
          } else {
            myDialog.negative(this.$q, 'Error', 'Failed to update evaluation instrument. No data returned from API.');
          }
        } catch (err) {
          console.error('Error updating evaluation:', err);
          myDialog.negative(this.$q, 'Error', 'Failed to update evaluation instrument. Please try again later.');
        }
      } else {
        try {
            let tmpEval = { ...this.evalDialog.form };
            tmpEval.rating_scale_id = parseInt(this.evalDialog.form.rating_scale_id.value);
          const response = await api.createEvaluationTemplate(tmpEval);
          if (response && response.data) {
            this.evaluations.push(response.data);
            myDialog.positive(this.$q, 'Success', 'New evaluation instrument created successfully.');
          } else {
            myDialog.negative(this.$q, 'Error', 'Failed to create evaluation instrument. No data returned from API.');
          }
        } catch (err) {
          console.error('Error creating evaluation:', err);
          myDialog.negative(this.$q, 'Error', 'Failed to create evaluation instrument. Please try again later.');
        }
      }
      this.evalDialog.isOpen = false;
      this.evalDialog.isEdit = false;
      this.evalDialog.form = { _id: null, name: '', rating_scale_id: null, status: 'INACTIVE', type: 'COURSE_EVAL' };
      this.getAllEvaluations();
    },

    hasActiveEvaluationOfType (type, excludedId = null) {
      return this.evaluations.some(evaluation => {
        const sameType = String(evaluation.type || '').toUpperCase() === String(type || '').toUpperCase();
        const sameRecord = String(evaluation._id) === String(excludedId);
        return sameType && !sameRecord && evaluation.status === 'ACTIVE';
      });
    },

    // 🔶 LEVEL 1 operations: Indicators array interactions
    addIndicator () {
    // 1. Push the new item row structure into the array
        this.indicators.push({
            evaluation_id: this.selectedEval._id,
            name: '',
            sort_order: this.indicators.length + 1,
            assigned_role: 'VCAA',
            status: 'INACTIVE',
            items: []
        });

        // 2. Wait for Vue to finish rendering the new card into the DOM
        this.$nextTick(() => {
            const scrollContainer = this.$refs.workspaceScroll;
            
            if (scrollContainer) {
            // 3. Smoothly animate the container down to its maximum scroll depth height
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth'
            });
            }
        });
    },

    removeIndicator (index) {
      this.indicators.splice(index, 1);
    },

    // 🔷 LEVEL 2 operations: Internal item nested mapping arrays
    addItem (indIdx) {
      const itemIdx = this.indicators[indIdx].items.length;
      this.indicators[indIdx].items.push({
        name: '',
        sort_order: itemIdx + 1,
        status: 'INACTIVE'
      });

      this.$nextTick(() => {
        const refKey = `${indIdx}-${itemIdx}`;
        this.itemRowRefs[refKey]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        this.itemInputRefs[refKey]?.focus();
      });
    },

    removeItem (indIdx, itemIdx) {
      this.indicators[indIdx].items.splice(itemIdx, 1);
    },

    // Processing transactional dispatch data loops
    async saveStructure () {

        //check if any indicators or items are present
        if (this.indicators.length === 0) {
          myDialog.negative(this.$q, 'Validation Error', 'No indicators or items to save. Please add at least one indicator and item before saving.');
          return;
        }
      
        //check each indicator and item for required fields
        for (let ind of this.indicators) {
          if (!ind.name || !ind.assigned_role || ind.sort_order === null || ind.sort_order === undefined) {
            myDialog.negative(this.$q, 'Validation Error', 'Please fill in all required fields for indicators before saving.');
            return;
          }
          for (let item of ind.items) {
            if (!item.name || item.sort_order === null || item.sort_order === undefined) {
              myDialog.negative(this.$q, 'Validation Error', 'Please fill in all required fields for items before saving.');
              return;
            }
          }
        }
        //check each indicator and item for sort_order uniqueness
        for (let ind of this.indicators) {
          let indicatorSortOrders = new Set();
          if (indicatorSortOrders.has(ind.sort_order)) {
            myDialog.negative(this.$q, 'Validation Error', 'Duplicate sort order found in indicators. Please ensure each indicator has a unique sort order.');
            return;
          }
          indicatorSortOrders.add(ind.sort_order);
          let itemSortOrders = new Set();
          for (let item of ind.items) {
            if (itemSortOrders.has(item.sort_order)) {
              myDialog.negative(this.$q, 'Validation Error', 'Duplicate sort order found in items. Please ensure each item has a unique sort order within its indicator.');
              return;
            }
            itemSortOrders.add(item.sort_order);
          }
        }
        let evalForm = this.selectedEval;
        if (!evalForm.name || !evalForm.rating_scale_id || !evalForm.type) {
          myDialog.negative(this.$q, 'Validation Error', 'Please ensure the evaluation instrument has a name, rating scale, and type before saving the structure.');
          return;
        }
        evalForm.indicators = this.indicators;

        let confirm = await myDialog.confirm(this.$q, 'Confirm Save', 'Are you sure you want to save the current structure layout?');
        if (!confirm) return;

       try{
        
        const response = await api.updateEvaluationTemplateProfile(evalForm);
        console.log('API response for saving evaluation structure:', response);
        if (response && response.success) {
          myDialog.positive(this.$q, 'Success', 'Evaluation structure saved successfully.');
          this.getAllEvaluations();
        } else {
          myDialog.negative(this.$q, 'Error', 'Failed to save evaluation structure. No data returned from API.');
        }
       } catch (err) {
         console.error('Error saving evaluation structure:', err);
         myDialog.negative(this.$q, 'Error', 'Failed to save evaluation structure. Please try again later.'); 
       }
    },

    async getRatingScales () {
      try {
        const response = await api.getAllRatingScales();
        if (response && response.data) {
            this.ratingScales = response.data;
        }
        else 
            myDialog.negative (this.$q,'Error','Failed to load rating scales. No data returned from API.');
      } catch (err) {
        console.error('Error fetching rating scales:', err);
        myDialog.negative (this.$q,'Error','Failed to load rating scales. Please try again later.');
      }
    },

    async getAllEvaluations () {
      try {
        const response = await api.getAllEvaluationTemplates();
        if (response && response.data) {
            this.evaluations = response.data;
        }
        else 
            myDialog.negative (this.$q,'Error','Failed to load evaluations. No data returned from API.');
      } catch (err) {
        console.error('Error fetching evaluations:', err);
        myDialog.negative (this.$q,'Error','Failed to load evaluations. Please try again later.');
      }
    },
  }, 
  mounted () {
    // Initial load of evaluations can be done here if needed
    this.getRatingScales();
    this.getAllEvaluations();
  }
}
</script>

<style scoped>
.full-height-card {
  min-height: 75vh;
}
.border-indicator {
  border: 1px solid #b0bec5 !important;
}
.border-item {
  border: 1px solid #cfd8dc !important;
}
.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}
.font-main {
  font-family: inherit;
}
</style>

