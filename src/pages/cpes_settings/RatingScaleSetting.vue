<template>
  <q-page padding class="q-gutter-y-md">
    
    <!-- 📄 MASTER SECTION: List of Rating Scales -->
    <q-card outlined>
      <q-card-section class="row justify-between items-center bg-primary text-white">
        <div class="text-h6">Rating Scale Frameworks</div>
        <q-btn 
          label="New Rating Scale" 
          icon="add" 
          color="secondary" 
          @click="initNewScale" 
        />
      </q-card-section>

      <!-- Grid list of existing scales -->
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div 
            v-for="item in existingScales" 
            :key="item._id" 
            class="col-12 col-md-4"
          >
            <q-card 
              flat 
              bordered 
              class="cursor-pointer transition-toggle"
              :class="{ 'bg-blue-1 border-primary': selectedScaleId === item._id }"
              @click="selectScale(item)"
            >
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold text-primary">{{ item.name }}</div>
                <div class="text-caption text-grey-7 q-mt-xs ellipsis-2-lines">
                  {{ item.description }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 🔍 DETAIL SECTION: Form appears only when creating or viewing/editing -->
    <q-form v-if="isFormOpen" @submit="confirmSave" ref="scaleForm">
      <q-card outlined class="q-mb-md">
        <q-card-section class="row justify-between items-center bg-grey-3 text-grey-9">
          <div class="text-subtitle1 text-weight-bold">
            {{ isEditMode ? 'Modify Scale Details' : 'Configure New Scale' }}
          </div>
          <q-btn icon="close" flat round dense color="grey" @click="isFormOpen = false" />
        </q-card-section>
        
        <!-- Form Inputs: Parent Object -->
        <q-card-section class="q-gutter-y-md">
          <q-input 
            v-model="form.scale.name" 
            label="Scale Name *" 
            outlined 
            :rules="[val => !!val || 'Name is required',
                //duplicate name check against existing scales
                val => form.scale.name.trim().toLowerCase() === form.scale.name.trim().toLowerCase() || existingScales.filter(scale => scale.name.trim().toLowerCase() === val.trim().toLowerCase()).length <= 1 || 'Duplicate scale name not allowed'
            ]"
          />
          <q-input 
            v-model="form.scale.description" 
            label="Global Description *" 
            type="textarea" 
            outlined 
            rows="2"
            :rules="[val => !!val || 'Description is required']"
          />
        </q-card-section>
      </q-card>

      <!-- Child Array Form: Rating Items -->
      <q-card outlined>
        <q-card-section class="row justify-between items-center bg-grey-2">
          <div class="text-subtitle2 text-weight-bold text-grey-8">Scale Range Items / Tiers</div>
          <q-btn label="Add Tier Range" icon="add" color="secondary" size="sm" @click="addItemRow" />
        </q-card-section>

        <q-card-section v-if="form.items.length === 0" class="text-center text-grey-6 q-pa-lg">
          No tier ranges added yet. Add brackets to represent your scoring thresholds.
        </q-card-section>

        <q-card-section v-else class="q-gutter-y-md">
          <div 
            v-for="(subItem, index) in form.items" 
            :key="index" 
            class="row q-col-gutter-sm items-start q-pa-sm border-panel rounded-borders bg-grey-1"
          >
            <!-- fixed_value integer only -->
            <q-input 
              v-model.number="subItem.fixed_value" 
              type="number" 
              step="1"
              inputmode="numeric"
              pattern="[0-9]*"
              label="Fixed Value (Optional)" 
              outlined 
              class="col-12 col-sm-1"
              :rules="[
                val => val === null || val === undefined || Number.isInteger(Number(val)) || 'Integer only',
                val => val === null || val === undefined || val >= 0 || 'Must be >= 0',
                val => form.items.filter(item => item.fixed_value === val).length <= 1 || 'Duplicate fixed value not allowed'
              ]"
            />
            <!-- Min Value -->
            <q-input 
              v-model.number="subItem.min_value" 
              type="number" 
              step="0.01" 
              label="Min Value of mean *" 
              outlined 
              class="col-12 col-sm-1"
              :rules="[
                val => val !== null && val !== undefined || 'Required',
                val => val >= 0 || 'Must be >= 0',
                val => validateOverlap(val, index, 'min')
              ]"
            />

            <!-- Max Value -->
            <q-input 
              v-model.number="subItem.max_value" 
              type="number" 
              step="0.01" 
              label="Max Value of mean *" 
              outlined 
              class="col-12 col-sm-1"
              :rules="[
                val => val !== null && val !== undefined || 'Required',
                val => val > subItem.min_value || 'Must exceed Min',
                val => validateOverlap(val, index, 'max')
              ]"
            />

            <!-- Label -->
            <q-input 
              v-model="subItem.description" 
              label="Tier Label *" 
              outlined 
              placeholder="e.g., Outstanding" 
              class="col-12 col-sm-4"
              :rules="[val => !!val || 'Required',
                val => form.items.filter(item => item.description.trim().toLowerCase() === val.trim().toLowerCase()).length <= 1 || 'Duplicate label not allowed'
              ]"
            />

            <!-- Interpretation Description -->
            <q-input 
              v-model="subItem.interpretation" 
              label="Deep Interpretation *" 
              outlined 
              placeholder="Detailed criteria context..." 
              class="col-12 col-sm-4"
              :rules="[val => !!val || 'Required']"
            />

            <!-- Splice out row button -->
            <div class="col-12 col-sm-1 text-center q-pt-sm">
              <q-btn icon="delete" color="negative" flat round dense @click="removeItemRow(index)" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Footer Actions -->
      <div class="row justify-end q-mt-md q-gutter-x-sm">
        <q-btn label="Cancel" color="grey" flat @click="isFormOpen = false, selectedScaleId = null, form = { scale: { name: '', description: '' }, items: [] } " />
        <q-btn label="Save Scale Framework" type="submit" color="primary" icon="save" />
      </div>
    </q-form>

  </q-page>
</template>

<script>
import { forEach } from 'lodash';
import  api  from 'src/API/api.js'
import myDialog from 'src/plugins/myDialog';

export default {
  name: 'RatingScaleManager',

  data () {
    return {
      // Mock tracking states for the master display view
      selectedScaleId: null,
      isFormOpen: false,
      isEditMode: false,

      // Simulated Master database payload list fetched from server
      existingScales: [
        { _id: '1', name: 'Core Competency Scale', description: 'Used to grade operational technical targets.' },
        { _id: '2', name: 'Leadership Assessment Metric', description: 'Used across standard executive management evaluations.' }
      ],

      // Form state structured for direct insertion mapping
      form: {
        scale: { name: '', description: '' },
        items: []
      }
    }
  },

  methods: {
    // Triggers a blank schema instantiation state configuration 
    initNewScale () {
      this.selectedScaleId = null
      this.isEditMode = false
      this.form.scale = { name: '', description: '' }
      this.form.items = []
      this.isFormOpen = true
    },

    // Mock operational action pulling data details for a targeted list selection
    selectScale (scaleRow) {
      this.selectedScaleId = scaleRow._id
      this.isEditMode = true
      
      // Seed data into forms fields (In real code, append an API endpoint fetch call here)
      this.form.scale = { ...scaleRow }
      
      // Seed mock child items belonging to this scale parent identification
      this.form.items = scaleRow.items
      this.isFormOpen = true
    },

    addItemRow () {
      this.form.items.push({rating_scale_id: this.selectedScaleId, min_value: 0, max_value: 0, description: '', interpretation: '' })
    },

    removeItemRow (index) {
      this.form.items.splice(index, 1)
    },

    // Evaluates numeric boundaries matching adjacent row sequences
    validateOverlap (value, index, type) {
      if (index === 0 && type === 'min') return true
      if (type === 'min' && index > 0) {
        const previousMax = this.form.items[index - 1].max_value
        if (value <= previousMax) {
          return `Must exceed previous max (${previousMax})`
        }
      }
      return true
    },

    // Triggers confirmation overlay block
   async confirmSave () {


      if (this.form.items.length === 0) {
        this.$q.notify({ type: 'negative', message: 'Add at least one range layout description item.' })
        return
      }

     let confirmation = await myDialog.confirm(this.$q, 'Confirm Save', 'Are you sure you want to save this rating scale framework?')
      if (!confirmation) return

        console.log('Dispatch API payload request data package:', this.form)

        if(this.selectedScaleId) {
          // Update existing scale
          let tmpScale = {...this.form.scale}
          try{
            let response = await api.updateRatingScaleProfile(tmpScale)
            if(!response.success){
              myDialog.negative(this.$q, 'Update Failed', response.error.response.data.message || 'An error occurred while updating the rating scale framework')
            }else{
              myDialog.positive(this.$q, 'Update Successful', 'Rating scale framework updated successfully!')
              this.isFormOpen = false
              this.selectedScaleId = null
              this.loadAllRatingScales() // Refresh the list after update
              this.form = { scale: { name: '', description: '' }, items: [] } // Reset form
            }

          }catch(error){
            console.error('Error updating rating scale framework:', error)
            myDialog.negative(this.$q, 'Update Failed', error.message || 'An error occurred while updating the rating scale framework')
          }
          
        } else {
          // Create new scale
          let tmpScale = {...this.form.scale}
          tmpScale.items = this.form.items.map(item => ({ ...item, rating_scale_id: null })) // Ensure new items have no parent ID yet
          try{
            let response = await api.createRatingScaleProfile(tmpScale)
            if(!response.success){
              myDialog.negative(this.$q, 'Creation Failed', response.error.response.data.message || 'An error occurred while creating the rating scale framework')
            }else{
              myDialog.positive(this.$q, 'Creation Successful', 'Rating scale framework created successfully!')
              this.isFormOpen = false
              this.selectedScaleId = null
              this.loadAllRatingScales() // Refresh the list after creation
              this.form = { scale: { name: '', description: '' }, items: [] } // Reset form 
            }
        
          }catch(error){
            console.error('Error creating rating scale framework:', error)
            myDialog.negative(this.$q, 'Creation Failed', error.message || 'An error occurred while creating the rating scale framework')
          }
        }
    },

    // Additional methods for API integration can be added here
    // get all existing scales.
    async loadAllRatingScales() {
      try {
        let response = await api.getAllRatingScales();
        if (response.success) {
          this.existingScales = response.data;
        } else {
          throw new Error('Failed to load rating scales.');
        }
      } catch (error) {
        console.error('Error loading rating scales:', error);
        this.$q.notify({ type: 'negative', message: 'Error loading rating scales.' });
      }
    },
  },
  mounted() {
    // Load existing scales from API when component mounts
    this.loadAllRatingScales();
  }
}
</script>

<style scoped>
.border-panel {
  border: 1px solid #e0e0e0;
}
.transition-toggle {
  transition: all 0.3s ease;
}
.transition-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
</style>
