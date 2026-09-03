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
          {{ Pagination }}
          <!-- end dialog -->
          <!-- employee list table  -->
            <q-table
              class="my-sticky-header-table"
              :rows="employeelist"
              :columns="header"
              row-key="email"
              :rows-per-page-options="[ 10, 1, 15, 20, 25, 50, 0 ]"
              :style="{height: $q.screen.xs ? '90.5%' : '96.5%', 'overflow-y': 'auto'}"
              virtual-scroll-sticky-size-start="100"
              v-model:pagination = "Pagination"
            >
              <template v-slot:body-cell="props">
                <q-td
                  :props="props"
                  :class="(props.row.position)?'text-black':'text-red'"                 
                >
                <span  style="cursor: pointer;" >{{props.value}}</span>
                  
                </q-td>
              </template>

              <template v-slot:top>
                  <q-space />
                  <q-input dense debounce="500" color="primary" v-model="filter" placeholder="Search" style="width: 50%;">
                    <template v-slot:append>
                      <q-icon name="search"/>
                    </template>
                  </q-input>
              </template>

              <template v-slot:pagination="scope">
                
                <q-btn
                v-if="scope.pagesNumber > 2"
                icon="first_page"
                color="grey-8"
                round
                dense
                flat
                :disable="scope.isFirstPage"
                @click="scope.firstPage"
                />

                <q-btn
                icon="chevron_left"
                color="grey-8"
                round
                dense
                flat
                :disable="scope.isFirstPage"
                @click="scope.prevPage"
                />

                <q-btn
                icon="chevron_right"
                color="grey-8"
                round
                dense
                flat
                :disable="scope.isLastPage"
                @click="scope.nextPage"
                />

                <q-btn
                v-if="scope.pagesNumber > 2"
                icon="last_page"
                color="grey-8"
                round
                dense
                flat
                :disable="scope.isLastPage"
                @click="scope.lastPage"
                />
              </template>

              <!-- ↓↓↓↓↓ this is for gridview such as viewing on small screen like android -->
              <!-- <template v-slot:item="props">
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

              </template> -->
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
    name: 'SelectEmployee',
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
      },

    },
    data(){
      return {
        testObj:{},
        filter:"",
        loading:false,
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
            }
          ],
        employeelist:[],
        Pagination: {
            sortBy: 'email',
            descending: false,
            page: 1,
            rowsPerPage: 10
            // rowsNumber: xx if getting data from a server
        },
      };
    },
    mounted(){
      this.queryEmployeeList();
    },
    watch:{

        filter(newVal){
            alert(newVal)
        }
        // filter: 'debouncedFilter',
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
  