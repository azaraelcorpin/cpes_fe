<template>
  <q-page padding>
    <div>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5">Academic Term Management</div>
        <q-btn color="primary" icon="add" label="New Academic Term" @click="openCreate" />
      </div>
      
      <!-- Quasar Data Table -->
      <q-table
        title="Academic Terms & Evaluation Categories"
        :rows="filteredTerms"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :loading="loading"
      >
        <template v-slot:top-right>
          <q-input v-model="filter" dense outlined clearable debounce="300" placeholder="Search terms" />
        </template>
        <!-- Custom slot for Type formatting -->
        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <q-badge :color="props.row.type === 'COURSE_EVAL' ? 'blue-8' : 'purple-8'">
              {{ props.row.type === 'COURSE_EVAL' ? 'Course Evaluation' : 'Program Evaluation' }}
            </q-badge>
          </q-td>
        </template>

        <!-- Custom slot for the status column -->
        <template v-slot:body-cell-is_active="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.is_active ? 'positive' : 'grey-4'"
              :text-color="props.row.is_active ? 'white' : 'grey-9'"
              icon="circle"
              size="sm"
            >
              {{ props.row.is_active ? 'Active' : 'Inactive' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-start_date="props">
          <q-td :props="props">{{ formatDate(props.value) }}</q-td>
        </template>

        <template v-slot:body-cell-end_date="props">
          <q-td :props="props">{{ formatDate(props.value) }}</q-td>
        </template>

        <!-- Custom slot for Action buttons -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-sm">
            <q-btn
              v-if="!props.row.is_active"
              label="Set Active"
              color="primary"
              size="sm"
              icon="check_circle"
              @click="setActiveTerm(props.row)"
            />
            <q-btn
              v-else
              label="Active"
              color="positive"
              size="sm"
              icon="verified"
              disabled
            />
            <q-btn icon="edit" flat round dense color="primary" @click="openEdit(props.row)" />
            <q-btn icon="delete" flat round dense color="negative" @click="removeTerm(props.row)" />
          </q-td>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="dialog">
      <q-card style="width: 620px; max-width: 95vw">
        <q-card-section class="text-h6">{{ editing ? 'Edit' : 'Create' }} Academic Term</q-card-section>
        <q-form @submit="saveTerm">
          <q-card-section class="row q-col-gutter-md">
            <q-input v-model="form.acad_year" class="col-12 col-md-6" outlined label="Academic Year" hint="Example: 2026-2027" :rules="[required]" />
            <q-select v-model="form.sem" class="col-12 col-md-6" outlined :options="semesterOptions" label="Semester" :rules="[required]" />
            <q-input v-model="form.start_date" class="col-12 col-md-6" outlined type="date" label="Start Date" :rules="[required]" />
            <q-input v-model="form.end_date" class="col-12 col-md-6" outlined type="date" label="End Date" :rules="[required, endDateAfterStart]" />
            <q-select v-model="form.type" class="col-12 col-md-6" outlined :options="typeOptions" label="Evaluation Type" :rules="[required]" />
            <q-toggle v-model="form.is_active" class="col-12 col-md-6" label="Active term" color="positive" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn color="primary" label="Save" type="submit" :loading="saving" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import api from 'src/API/api.js'

export default {
  name: 'AcademicTerms',

  data () {
    return {
      loading: false,
      saving: false,
      dialog: false,
      editing: false,
      filter: '',
      semesterOptions: ['1st Semester', '2nd Semester', 'Summer'],
      typeOptions: ['COURSE_EVAL', 'PROGRAM_EVAL'],
      columns: [
        { name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true },
        { name: 'type', label: 'Evaluation Type', align: 'left', field: 'type', sortable: true },
        { name: 'acad_year', label: 'Academic Year', align: 'left', field: 'acad_year', sortable: true },
        { name: 'sem', label: 'Semester', align: 'left', field: 'sem', sortable: true },
        { name: 'start_date', label: 'Start Date', align: 'center', field: 'start_date', sortable: true },
        { name: 'end_date', label: 'End Date', align: 'center', field: 'end_date', sortable: true },
        { name: 'is_active', label: 'Status', align: 'center', field: 'is_active' },
        { name: 'actions', label: 'Actions', align: 'center' }
      ],
      academicTerms: [],
      form: this.emptyForm()
    }
  },

  computed: {
    filteredTerms () {
      const search = this.filter.toLowerCase()
      return this.academicTerms.filter(term => [term.acad_year, term.sem, term.type, term.start_date, term.end_date]
        .some(value => String(value || '').toLowerCase().includes(search)))
    }
  },

  created () {
    this.loadTerms()
  },

  methods: {
    emptyForm () {
      return { id: null, acad_year: '', sem: '', start_date: '', end_date: '', type: 'COURSE_EVAL', is_active: false }
    },
    required (value) {
      return value !== null && value !== undefined && value !== '' || 'This field is required'
    },
    endDateAfterStart (value) {
      return !value || !this.form.start_date || value >= this.form.start_date || 'End date must be on or after start date'
    },
    formatDate (value) {
      if (!value) return ''
      return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
    },
    async loadTerms () {
      this.loading = true
      try {
        const response = await api.getAllAcademicTerms()
        if (!response || response.error) throw new Error('Unable to load academic terms')
        this.academicTerms = response.data || []
      } catch (error) {
        this.$q.notify({ type: 'negative', message: 'Unable to load academic terms.' })
      } finally {
        this.loading = false
      }
    },
    openCreate () {
      this.form = this.emptyForm()
      this.editing = false
      this.dialog = true
    },
    openEdit (term) {
      this.form = { ...term }
      this.editing = true
      this.dialog = true
    },
    async saveTerm () {
      if (this.form.is_active && this.academicTerms.some(term => term.type === this.form.type && term.is_active && term.id !== this.form.id)) {
        this.$q.notify({ type: 'negative', message: 'Only one active term is allowed per evaluation type.' })
        return
      }

      this.saving = true
      try {
        const response = this.editing
          ? await api.updateAcademicTerm(this.form)
          : await api.createAcademicTerm(this.form)
        if (!response || response.error) throw new Error('Unable to save academic term')
        this.dialog = false
        await this.loadTerms()
        this.$q.notify({ type: 'positive', message: 'Academic term saved successfully.' })
      } catch (error) {
        this.$q.notify({ type: 'negative', message: 'Unable to save academic term.' })
      } finally {
        this.saving = false
      }
    },
    setActiveTerm (selectedRow) {
      const typeLabel = selectedRow.type === 'COURSE_EVAL' ? 'Course Evaluation' : 'Program Evaluation'
      this.$q.dialog({
        title: 'Confirm Activation',
        message: `Are you sure you want to set this as the active term for ${typeLabel}?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        const sameType = this.academicTerms.filter(term => term.type === selectedRow.type && term.id !== selectedRow.id && term.is_active)
        try {
          for (const term of sameType) await api.updateAcademicTerm({ ...term, is_active: false })
          const response = await api.updateAcademicTerm({ ...selectedRow, is_active: true })
          if (!response || response.error) throw new Error('Unable to activate term')
          await this.loadTerms()
          this.$q.notify({ type: 'positive', message: `${typeLabel} active term updated successfully!`, position: 'top-right' })
        } catch (error) {
          this.$q.notify({ type: 'negative', message: 'Unable to activate academic term.' })
        }
      });
    },
    removeTerm (term) {
      this.$q.dialog({ title: 'Confirm Delete', message: `Delete ${term.acad_year} ${term.sem}?`, cancel: true, persistent: true }).onOk(async () => {
        try {
          const response = await api.deleteAcademicTerm(term.id)
          if (!response || response.error) throw new Error('Unable to delete term')
          await this.loadTerms()
          this.$q.notify({ type: 'positive', message: 'Academic term deleted successfully.' })
        } catch (error) {
          this.$q.notify({ type: 'negative', message: 'Unable to delete academic term.' })
        }
      })
    }
  }
}
</script>


<style scoped>
/* Optional custom spacing if needed */
</style>
