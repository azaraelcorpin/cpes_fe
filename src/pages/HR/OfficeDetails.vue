<template>
  <q-page class="q-pa-sm">
      <q-inner-loading :showing="loading" style="z-index: 1000;" >
        <q-spinner-gears size="90px" color="primary"/>
      </q-inner-loading>

        <!-- Test button -->
      <q-btn v-if="hasRolesManageOffices" @click="$router.push({name:'offices'})" style="  position: fixed;right: 1%; z-index: 1000;">
        Back to Office Management
      </q-btn>
      <!-- test button -->

      <q-card class="pa-1">      

        <q-card-section class="container--fluid " style="height: 89vh;">
          
            <div class="text-h4">{{(OFFICE_INFO.Description??'').toUpperCase()}} </div>
            <div v-if="getOfficeHead()">
              <div class="text-h6">{{getOfficeHeadFullname().toUpperCase()}} </div>
              <div class="text-h7">{{getOfficeHead().position.toUpperCase()}} </div>
            </div>
            <div v-else>
              <div class="text-h7" style="color: red;">No Office Head Assigned </div>
            </div>
            <q-btn @click="loading = !loading">test</q-btn>
            <div class="q-mt-lg" >
              <q-dialog v-model="loading"   >
                <add-employee style="width: 50%;"></add-employee>
              </q-dialog>
                <q-table
                class="my-sticky-header-table"
                :grid="$q.screen.xs"
                :rows="OFFICE_EMPLOYEES"
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
                  <q-btn push color="primary" icon="person_add" >
                    <q-tooltip class="bg-primary">Add New Employee</q-tooltip>
                  </q-btn>
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
            </div>
        </q-card-section> 
      </q-card>
  </q-page> 
  
</template>
<script>
import { defineComponent } from 'vue'
import api from 'src/API/api';
import dialog from 'src/plugins/myDialog';
import { useQuasar } from 'quasar';
import AddEmployee from '../MyOffice/AddEmployee.vue';

export default defineComponent({
  setup(){
    const $q = useQuasar();
    return{

    }
  },
  components:{
    AddEmployee,
  },
  data(){
    return{
      filter:"",
      loading:true,
      UserType:null,
      OFFICE_INFO:{},
      OFFICE_EMPLOYEES:[],
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
              label: 'Name',
              align: 'left',
              field: 'fullname',
              sortable: true
            },
            {
              name: 'position',
              label: 'Position',
              align: 'left',
              field: 'position',
              sortable: true
            },
            {
              name: 'roles',
              label: 'PCR Type',
              align: 'left',
              field: 'roles',
              format:(val,row)=>{return val==='OFFICE_HEAD'?"OPCR":"IPCR"},
              sortable: true
            },
            {
              name: 'action',
              label: 'Action',
              align: 'center',
            },
          ],
    }
  },
  methods:{
    async getOfficeData(){
      try {
        this.loading = true;
        let response = await api.getOfficeData(this.$route.params.id);
        console.log('getOfficeData', response)
        if(response.error){
              dialog.negative(this.$q,response.error.data.status,response.error.data.message).onOk(()=>{
                if(this.$route.meta.from.name){
                  this.$router.push(this.$route.meta.from);
                }
                else
                   this.$router.push({name:'dashboard'});
            }) ; 
        }else{
          this.OFFICE_INFO = response.OFFICE.info;
          this.OFFICE_EMPLOYEES = response.OFFICE.employees;
        }
        
      } catch (error) {
        console.log('error',error)
      }
      this.loading = false;
    },
    getOfficeHead(){
      return this.OFFICE_EMPLOYEES.find(emp=> emp.roles==='OFFICE_HEAD')
    },
    getOfficeHeadFullname(){
      let head = this.getOfficeHead();
      let name = head.fName+' '+(head.mName?head.mName[0]+'. ':'')+head.lName
      return name;
    }
  },
  mounted(){
    // alert(this.$route.params.id)
    /**
     * Checking if the user is authorized to access this office details... checking if user has office id on officesRoles
     */
     const ImDev = localStorage.getItem('ImDev');
     if(ImDev){ this.UserType = 'ImDev';    this.getOfficeData();  return }    /// if developer pass to all auth

      this.UserType = null;
      const offices = JSON.parse(localStorage.getItem('officesAndRoles'));    
      let role = offices?offices.find(item=>(item.office_id+'' === this.$route.params.id && item.role === 'OFFICE_HEAD')):null;
      role = role??(offices??[]).find(item=>(item.office_id+'' === this.$route.params.id && item.role === 'OFFICE_STAFF'));

      const roles = JSON.parse(localStorage.getItem('userRoles')); 
      // console.log('role',offices.find(item=>(item.office_id+'' === this.$route.params.id && item.role === 'OFFICE_HEAD')))
      if(role || roles.find(item=>(item === 'HR')))
            this.UserType = role?role.role:'HR'        
      else{
        dialog.negative(this.$q,"Forbidden","Access Denied on "+this.$route.meta.title).onOk(()=>{
                  if(this.$route.meta.from.name){
                    this.$router.push(this.$route.meta.from);
                  }
                  else
                    this.$router.push({name:'dashboard'});
          }) ; 
      }
      this.getOfficeData()        
  },
  computed:{
    hasRolesManageOffices(){
      const roles = JSON.parse(localStorage.getItem('userRoles')); 
      return(this.UserType === 'ImDev' || roles.find(item=>(item === 'HR')))      
    }
  }
})
</script>
<style>

</style>
