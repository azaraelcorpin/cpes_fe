<template>
    <q-page class="q-pa-sm">
      <q-inner-loading :showing="loading" style="z-index: 1000;" >
        <q-spinner-gears size="90px" color="primary"/>
      </q-inner-loading>

        <!-- Test button -->
      <!-- <q-btn @click="loading=!loading" style="  position: fixed;right: 1%; z-index: 1000;">
        loading test
      </q-btn> -->
      <!-- test button -->

      <q-card class="pa-1">      

        <q-card-section class="container--fluid" style="height: 89vh;">
          <div class="text-h4">Employee Management </div>
          <!-- new Employee dialog -->
          <q-dialog v-model="newEmployeeDialog" persistent >
            <q-card  :style="{ width: $q.screen.xs ? '100%' : '50%' }" >   
              <q-form @submit="newEmployee" @reset="newEmployeeReset">
                <q-inner-loading :showing="loading"
                label="Updating Record..."
                label-class="text-black"
                label-style="font-size: 1.1em"
                color="black"
                style="z-index: 1000;" 
                >
              </q-inner-loading>
                <q-page-container style="padding:10px;" >                
                  <div class="text-h5" style="margin: 5px;">{{!NEW_EMPLOYEE.id?'New ':'Update '}} Employee</div> 
                  <!-- lname -->
                  <q-input 
                    required 
                    label="Lastname" 
                    dense 
                    outlined 
                    class="q-pa-sm" 
                    color="primary" 
                    v-model="NEW_EMPLOYEE.lname"
                    :rules="[rules.noSpaceStart,rules.requiredField]"
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
                    v-model="NEW_EMPLOYEE.fname"
                    :rules="[rules.noSpaceStart,rules.requiredField]"
                    >
                  </q-input>  
                  <!-- mname -->
                  <q-input 
                    label="Middlename" 
                    dense 
                    outlined 
                    class="q-pa-sm" 
                    color="primary" 
                    v-model="NEW_EMPLOYEE.mname"
                    :rules="[rules.noSpaceStartButAllowNullOrEmpty,rules.properWordStart]"
                    >
                  </q-input>  
                  <!-- email -->
                  <q-input 
                     
                    label="Email" 
                    dense 
                    outlined 
                    class="q-pa-sm" 
                    color="primary" 
                    v-model="NEW_EMPLOYEE.email"
                    :rules="[rules.properEmail]"
                    >
                    <template v-slot:prepend>
                      <q-icon name="email" />
                    </template>
                  </q-input> 

                  <div style="display: flex; justify-content: flex-end;">
                    <q-btn class="q-ma-md" color="primary" v-if="NEW_EMPLOYEE.id" type="submit">Update</q-btn>
                    <q-btn class="q-ma-md" color="primary" v-else type="submit">Save</q-btn>
                    <q-btn class="q-ma-md" type="reset">Cancel</q-btn>
                  </div>

                </q-page-container>
              </q-form>           
            </q-card>
          </q-dialog>
          <!-- end dialog -->
          <!-- employee list table  -->
            <q-table
              class="my-sticky-header-table"
              :grid="$q.screen.xs"
              :rows="employeelist"
              :columns="header"
              row-key="email"
              :rows-per-page-options="[ 10, 1, 15, 20, 25, 50, 0 ]"
              :filter="filter"
              :style="{height: $q.screen.xs ? '90.5%' : '96.5%', 'overflow-y': 'auto'}"
              virtual-scroll-sticky-size-start="100"
            >
              <template v-slot:body-cell="props">
                <q-td
                  :props="props"
                  :class="(props.row.position)?'text-black':'text-red'"
                >
                  {{props.value}}
                </q-td>
              </template>

              <template v-slot:body-cell-action="props">
                <q-td :props="props" 
                  :class="(props.row.status =='Inactive')?'text-red':'text-black'">
                  <q-btn color="positive" icon="edit" round flat @click="showUpdateEmployeeDialog(props.row)"></q-btn>
                  <q-btn color="negative" icon="delete" round flat :disabled="props.row.position" @click="deleteEmployee(props.row)"></q-btn>
                </q-td>
              </template>   
              <template v-slot:top>
                <q-btn push color="primary" @click=" newEmployeeReset(), newEmployeeDialog = !newEmployeeDialog">New Employee</q-btn>
                  <q-space />
                  <q-input dense debounce="300" color="primary" v-model="filter" placeholder="Search">
                    <template v-slot:append>
                      <q-icon name="search" />
                    </template>
                  </q-input>
              </template>

              <!-- ↓↓↓↓↓ this is for gridview such as viewing on small screen like android -->
              <template v-slot:item="props">
                <q-card style="width: 100%;height:min-content;" class="q-ma-sm">
                  <q-list dense>
                    <q-item v-for="col in props.cols" :key="col.name">
                      <q-item-section>
                        <q-item-label>{{ col.label }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-chip v-if="col.name === 'status'"
                          :color="props.row.status == 'Active' ? 'green': props.row.status == 'Disable' ? 'red': 'grey'"
                          text-color="white"
                          dense
                          class="text-weight-bolder"
                          square
                        >{{col.value}}
                        </q-chip>
                        <div v-else-if="col.name === 'action'"  class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition">
                          <q-btn color="positive" icon="edit" round flat @click="showUpdateEmployeeDialog(props.row)"></q-btn>
                          <q-btn color="negative" icon="delete" round flat @click="deleteEmployee(props.row)"></q-btn>
                        </div>
                        <q-item-label v-else caption :class="col.classes ? col.classes : ''">{{ col.value }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card>

              </template>
              <!-- ↑↑↑↑↑ this is for gridview such as viewing on small screen like android -->

            </q-table>
          <!-- end list table  -->
        </q-card-section>
      </q-card>
    </q-page>
  </template>
  
  <script>
  import { defineComponent } from 'vue'  
  import api from "src/API/api";
  import dialog from "src/plugins/myDialog"
  import { useQuasar } from 'quasar'
  
  export default defineComponent({
    name: 'EmployeeMgt',
    setup(){
      const $q = useQuasar();
      return{
        dialog
      }
    },
    methods:{
       test(evt, row){
        console.log({...row})
        row.office = new Date().toUTCString()

      },

      async queryEmployeeList(){
        try {
          this.loading = true;
          let response = await api.getAllEmployee();
          console.log('getAllEmployee', response)
          this.employeelist = response.EMPLOYEES;
        } catch (error) {
          console.log('error',error)
        }
        this.loading = false;
      },

      async newEmployee(){
        if(this.NEW_EMPLOYEE.id){
          this.updateEmployee()
        }else{
          try {
            this.loading = true;
            console.log(this.NEW_EMPLOYEE);
            let response = await api.newEmployee(this.NEW_EMPLOYEE);
            console.log('newEmployee',response)          
            if(response.error){
              dialog.negative(this.$q,response.error.data.status,response.error.data.message)           
            }else{
              dialog.positive(this.$q,response.status,response.message).onOk(()=>{
                this.newEmployeeReset();
                this.queryEmployeeList();
              }) ;
            }
            
          } catch (error) {
            console.log('error',error)
          }
          this.loading = false;
        }
      },

      async updateEmployee(){
        try {
          
          dialog.confirm(this.$q,"Confirmation","Would you like to update this employee?")
          .onOk(async() => {
              this.loading = true;
              let response = await api.updateEmployee(this.NEW_EMPLOYEE);
              console.log('updateEmployee',response)      
              if(response.error){
                dialog.negative(this.$q,response.error.data.status,response.error.data.message)           
              }else{
                this.loading = false; 
                dialog.positive(this.$q,response.status,response.message).onOk(()=>{
                  this.queryEmployeeList();
                  this.newEmployeeReset();
                }) ;
              }     
              this.loading = false;                                      
            })               
        } catch (error) {
          console.log('error',error)
        }
        this.loading = false;
      },      

      async deleteEmployee(param){
        try {

          dialog.confirm(this.$q,"Confirmation","Would you like to delete "+param.email+"?")
          .onOk(async() => {
              this.loading = true;
              let response = await api.deleteEmployee(param);
              console.log('deleteEmployee',response)          
              if(response.error){
                dialog.negative(this.$q,response.error.data.status,response.error.data.message)           
              }else{
                dialog.positive(this.$q,response.status,response.message).onOk(()=>{
                  this.queryEmployeeList();
                }) ;
              }
              this.loading = false;
            })
          .onCancel(() => {
            return
          }) 
          
        } catch (error) {
          console.log('error',error)
        }
        this.loading = false;
      },

      showUpdateEmployeeDialog(row){
        this.testObj = row;
        let tmp = {...row};
        console.log('tmp',tmp)
        this.NEW_EMPLOYEE.email = tmp.email;
        this.NEW_EMPLOYEE.lname = tmp.lName;
        this.NEW_EMPLOYEE.fname = tmp.fName;
        this.NEW_EMPLOYEE.mname = tmp.mName;
        this.NEW_EMPLOYEE.id = tmp.id
        this.newEmployeeDialog = true;
      },

      newEmployeeReset(){
        this.NEW_EMPLOYEE={
              id:null,
              email:null,
              lname:null,
              fname:null,
              mname:null,
              email:null,
            }
            this.newEmployeeDialog = false;
      }
    },
    data(){
      return {
        testObj:{},
        filter:"",
        loading:false,
        newEmployeeDialog:false,
        rules: {
                noSpace: v => (!v?.includes(' ')) || "No space allowed.",
                properWordStart: v => !v || /^[a-zA-Z_]/.test(v) ||  'Must Start with letter.',
                notEmpty:(v) => (v && v.replaceAll(' ','').length > 0) ||  "Empty Value.",
                noSpaceStart:(v) => (v && v.charAt(0) != ' ') || "No space allowed at start",
                noSpaceStartButAllowNullOrEmpty:(v) => (v === null || (v??'').length === 0 ) || (v && v.charAt(0) != ' ') || "No space allowed at start",
                requiredField: v => !!v || "Required field.", 
                requiredSelection: v => !!v || "Required at least one selection",
                properEmail: v => !v || /^\w+([.-]?\w+)*@msugensan\.edu\.ph$/.test(v) ||  'E-mail must be valid. Ex. juandelacruz@msugensan.edu.ph',
                matchPassword: v => v === this.form.password || "Does not match new password.",
                mobileNumber: v => !v || /^(09)\d{9}$/.test(v) || 'Mobile number must be valid. Ex. starts with (09) followed by xxxxxxxxx, where x = numeric character only', 
                maxLength: (v) => (v && v.length <= 12) || "Max 12 characters",
                numbers: (v) => (!isNaN(v) && /^[0-9.]*$/.test(v)) || !v || "Must be positive numbers only",
                currency: v => (/^[1-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/.test(v)) || (/^[1-9]\d*(((,\d{3}){2})?(\.\d{0,2})?)$/.test(v)) || (/^[0]\.\d{0,2}$/.test(v))|| v ==="0.00" || v ==="0"  || 'Currency value only',
                // float: (v) => ((!isNaN(this.StringToNumber(v)) && this.StringToNumber(v).indexOf('.') != -1) || (!isNaN(this.StringToNumber(v)) && /^[0-9]*$/.test(this.StringToNumber(v)))) || "Must be a number"
                ///^(09|\+639)\d{9}$/ <- if needed full philippine mobile number 
            },
        NEW_EMPLOYEE:{
          id:null,
          email:null,
          lname:null,
          fname:null,
          mname:null,
          email:null,
        },
        header : [
            {
              name: 'email',
              label: 'Email',
              align: 'left',
              field: 'email',
              sortable: true
            },
            {
              name: 'fullname',
              label: 'Fullname',
              align: 'left',
              field: 'fullname',
              sortable: true
            },
            {
              name: 'position',
              label: 'Office - Position',
              align: 'left',
              field: 'position',
              format: (value) => { return value??'Inactive';},
              sortable: true
            },
            {
              name: 'action',
              label: 'Action',
              align: 'center',
            },
          ],
        employeelist:[],
      };
    },
    mounted(){
      this.queryEmployeeList();
    }
  })
  </script>
  <style>
    .custom-container {
        height: 89vh;
      }
    .my-sticky-header-table .q-table__middle {
      max-height: 89vh;
    }
    .my-sticky-header-table .q-table__top,
    .my-sticky-header-table .q-table__bottom,
    .my-sticky-header-table thead tr:first-child th {
      background-color: #ffffff;
      z-index: 1000;
    }
    .my-sticky-header-table thead tr:first-child th {
      position: sticky;
      top: 0;
    }
    .grid-style-transition {
      transition: transform 0.28s, background-color 0.28s;
    }
  </style>
  