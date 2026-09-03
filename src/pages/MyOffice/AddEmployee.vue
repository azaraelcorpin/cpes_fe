<template>
    <div style="background: #7aaf8e;">
      <q-card  >   
        <q-form >
        <q-page-container style="padding:1px;" >                
            <div class="text-h5 bg-primary text-white" style="border-radius:3px 3px 0px 0px" >Add Employee</div>
            {{ typeof model }}
            <q-select
                filled
                v-model="model"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                :options="options"
                option-label="fullname"
                option-value=""
                @filter="filterFn"
                @input-value="setModel"                
                hint="Select Employee"
                style="width: 100%; padding-bottom: 32px"
            >
                <template v-slot:no-option>
                <q-item>
                    <q-item-section class="text-grey">
                    No results
                    </q-item-section>
                </q-item>
                </template>
            </q-select> 
            <!-- lname -->
            <q-input 
            required 
            label="Lastname" 
            dense 
            outlined 
            class="q-pa-sm" 
            color="primary" 
            v-model="NEW_EMPLOYEE.lName"
            :disable="NEW_EMPLOYEE.id !== null"
            >
            </q-input> 
            <!-- fname -->
            <q-input 
            required 
            label="Firstname" 
            dense 
            outlined 
            class="q-pa-sm" 
            color="primary" 
            v-model="NEW_EMPLOYEE.fName"
            :disable="NEW_EMPLOYEE.id !== null"
            >
            </q-input>  
            <!-- mname -->
            <q-input 
            label="Middlename" 
            dense 
            outlined 
            class="q-pa-sm" 
            color="primary" 
            v-model="NEW_EMPLOYEE.mName"
            :disable="NEW_EMPLOYEE.id !== null"
            >
            </q-input>  
            <!-- email -->
            <q-input 
            required 
            label="Email" 
            dense 
            outlined 
            class="q-pa-sm" 
            color="primary" 
            v-model="NEW_EMPLOYEE.email"
            :disable="NEW_EMPLOYEE.id !== null"
            >
            <template v-slot:prepend>
                <q-icon name="email" />
            </template>
            </q-input> 
            <!-- position -->
            <q-input 
            label="Position" 
            dense 
            outlined 
            class="q-pa-sm" 
            color="primary" 
            v-model="NEW_EMPLOYEE.position"
            ></q-input>   
            <div class="q-gutter-sm">
              <q-radio v-model="NEW_EMPLOYEE.role" val="OFFICE_HEAD" label="Head of Office" />
              <q-radio v-model="NEW_EMPLOYEE.role" val="INDIVIDUAL" label="Personnel" />
              <q-radio v-model="NEW_EMPLOYEE.role" val="OFFICE_STAFF" label="Office Staff" />
            </div>                

            <div style="display: flex; justify-content: flex-end;">
            <q-btn class="q-ma-md" color="primary" type="submit">Save</q-btn>
            <q-btn class="q-ma-md" type="reset">Cancel</q-btn>
            </div>

        </q-page-container>
        </q-form>           
      </q-card>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import api from 'src/API/api';

  const stringOptions = [{name:'test',id:1},{name:'test2',id:2},{name:'test3',id:3},{name:'test4',id:4},{name:'test5',id:5},
  {name:'fers1',id:11},{name:'fers2',id:12},{name:'fers3',id:13},{name:'fers4',id:14},{name:'fers5',id:15},
  {name:'wers1',id:31},{name:'wrs2',id:32},{name:'frwe3',id:23},{name:'wers4',id:44},{name:'rwes5',id:25}]

  export default {
    setup () {
        const model = ref("")
        const options = ref([])

        return {
        model,
        options,

        setModel (val) {
            model.value = val
        }
        }
    },
    data() {
      return {
        dialog:false,
        NEW_EMPLOYEE:{
          lName:null,
          fName:null,
          mName:null,
          email:null,
          id:null,
          position:null,
          role:'INDIVIDUAL'
        }
      };
    },
    methods: {
      filterFn (val, update, abort) {
            update(() => {
             
             if(val.length > 1 || this.model.length > 1){
              const needle = val.toLocaleLowerCase()
              this.options = this.options.filter(v => v.fullname.toLocaleLowerCase().indexOf(needle) > -1)
              console.log('model',this.model)
              if(this.options.length === 0 || !this.model.includes(","))
              this.querySearchEmployee(val)
             }
             else{
              if(this.model.id)
              return
              this.options = []
             }
            })
        },
      saveContact() {
        // Handle form submission here
        // You can access the form data in this.contact
        console.log('Contact saved:', this.model);
        // You can also send this data to an API, store it in Vuex, or perform other actions as needed
      },
      populateFields(){
        if((typeof this.model) === 'object')
        {console.log('pass',this.model)
          this.NEW_EMPLOYEE.lName = this.model.lName
          this.NEW_EMPLOYEE.fName = this.model.fName
          this.NEW_EMPLOYEE.mName = this.model.mName
          this.NEW_EMPLOYEE.email = this.model.email
          this.NEW_EMPLOYEE.id = this.model.id
        }else{
          this.NEW_EMPLOYEE.lName = null
          this.NEW_EMPLOYEE.fName = null
          this.NEW_EMPLOYEE.mName = null
          this.NEW_EMPLOYEE.email = null
          this.NEW_EMPLOYEE.id = null
        }
      },
      async querySearchEmployee(val){
        try {
          this.loading = true;
          let response = await api.searchEmployee(val);
          console.log('searchEmployee', response)
          this.options = response.EMPLOYEES;  
        } catch (error) {
          console.log('error',error)
        }
        this.loading = false;
      },      
    },
    watch:{
      model(newVal){
        this.populateFields();
      }
    }
  };
  </script>
  
  <style scoped>
    .form-group {
      margin-bottom: 10px;
    }
    .btn {
      margin-right: 10px;
    }
    .form-actions {
      margin-top: 20px;
    }
  </style>
  