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
          <div class="text-h4">User Management </div>
          <!-- new User dialog -->
          <q-dialog v-model="newUserDialog" persistent >
            <q-card  :style="{ width: $q.screen.xs ? '100%' : '50%' }" >   
              <q-form @submit="newUser" @reset="newUserReset">
                <q-inner-loading :showing="loading"
                label="Updating Record..."
                label-class="text-black"
                label-style="font-size: 1.1em"
                color="black"
                style="z-index: 1000;" 
                >
              </q-inner-loading>
                <q-page-container style="padding:10px;" >                
                  <div class="text-h5" style="margin: 5px;">{{!NEW_USER.email_old?'New ':'Update '}} User</div> 
                  <q-input 
                    required 
                    label="Email" 
                    dense 
                    outlined 
                    class="q-pa-sm" 
                    color="primary" 
                    v-model="NEW_USER.email"
                    :rules="[rules.properEmail,rules.requiredField]"
                    >
                    <template v-slot:prepend>
                      <q-icon name="email" />
                    </template>
                  </q-input>   

                  <q-input 
                    label="Fullname" 
                    dense 
                    outlined 
                    class="q-pa-sm" 
                    color="primary" 
                    v-model="NEW_USER.userName"
                    :rules="[rules.requiredField,rules.notEmpty,rules.noSpaceStart]"
                    >
                    <template v-slot:prepend>
                      <q-icon name="person_outline" />
                    </template>
                  </q-input>  

                  <!-- OFFICE_HEAD is excluded from selection, 
                      OFFICE_HEAD is at employee.position table
                  -->
                  <q-select 
                    outlined  
                     :options="['ADMIN','PMT','HR','OFFICE_STAFF']" 
                    label="User Type" 
                    class="q-pa-sm" 
                    color="primary" 
                    v-model="NEW_USER.userType"
                    :rules="[rules.requiredField]"
                    >
                    <template v-slot:prepend>
                      <q-icon name="assignment_ind" />
                    </template>
                  </q-select>

                  <q-select 
                    v-if="NEW_USER.userType === 'OFFICE_STAFF'"
                    outlined  
                    :options="offices" 
                    option-label="code"
                    label="Office" 
                    class="q-pa-sm" 
                    color="primary"  
                    v-model="NEW_USER.officeId"
                    :rules="[rules.requiredField]"
                    >
                    <template v-slot:prepend>
                      <q-icon name="assignment" />
                    </template>                
                  </q-select>

                  <div class="q-gutter-sm" v-if="NEW_USER.email_old">
                    <q-radio v-model="NEW_USER.status" val="Active" label="Active" />
                    <q-radio v-model="NEW_USER.status" val="Inactive" label="Inactive" />
                  </div>
                  <div style="display: flex; justify-content: flex-end;">
                    <q-btn class="q-ma-md" color="primary" v-if="NEW_USER.email_old" type="submit">Update</q-btn>
                    <q-btn class="q-ma-md" color="primary" v-else type="submit">Save</q-btn>
                    <q-btn class="q-ma-md" type="reset">Cancel</q-btn>
                  </div>

                </q-page-container>
              </q-form>           
            </q-card>
          </q-dialog>
          <!-- end dialog -->
          <!-- user list table  -->
            <q-table
              class="my-sticky-header-table"
              :grid="$q.screen.xs"
              :rows="userlist"
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
                  :class="(props.row.status =='Inactive')?'text-red':'text-black'"
                >
                  {{props.value}}
                </q-td>
              </template>

              <template v-slot:body-cell-action="props">
                <q-td :props="props" 
                  :class="(props.row.status =='Inactive')?'text-red':'text-black'">
                  <q-btn color="positive" icon="edit" round flat @click="showUpdateUserDialog(props.row)"></q-btn>
                  <q-btn color="negative" icon="delete" round flat @click="deleteUser(props.row)"></q-btn>
                </q-td>
              </template>   
              <template v-slot:top>
                <q-btn push color="primary" @click=" newUserReset(), newUserDialog = !newUserDialog">New User</q-btn>
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
                          <q-btn color="positive" icon="edit" round flat @click="showUpdateUserDialog(props.row)"></q-btn>
                          <q-btn color="negative" icon="delete" round flat @click="deleteUser(props.row)"></q-btn>
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
    name: 'UserMgt',
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

      async queryOffices(){
        try {
          this.loading = true;
          let response = await api.getAllOffice();
          console.log('getOffices', response.message)
          this.offices = response.OFFICES;
        } catch (error) {
          console.log('error',error)
        }
        this.loading = false;
      },

      async queryUserList(){
        try {
          this.loading = true;
          let response = await api.getAllUser();
          console.log('getAllUser', response)
          this.userlist = response.USERS;
        } catch (error) {
          console.log('error',error)
        }
        this.loading = false;
      },

      async newUser(){
        if(this.NEW_USER.email_old){
          this.updateUser()
        }else{
          try {
            this.loading = true;
            console.log(this.NEW_USER);
            let response = await api.newUser(this.NEW_USER);
            console.log('newUser',response)          
            if(response.error){
              dialog.negative(this.$q,response.error.data.status,response.error.data.message)           
            }else{
              dialog.positive(this.$q,response.status,response.message).onOk(()=>{
                this.newUserReset();
                this.queryUserList();
              }) ;
            }
            
          } catch (error) {
            console.log('error',error)
          }
          this.loading = false;
        }
      },

      async updateUser(){
        try {
          
          dialog.confirm(this.$q,"Confirmation","Would you like to update this user?")
          .onOk(async() => {
              this.loading = true;
              let response = await api.updateUser(this.NEW_USER);
              console.log('updateUser',response)      
              if(response.error){
                dialog.negative(this.$q,response.error.data.status,response.error.data.message)           
              }else{
                this.loading = false; 
                dialog.positive(this.$q,response.status,response.message).onOk(()=>{
                  // this.queryUserList();
                  this.testObj.email = this.NEW_USER.email
                  this.testObj.username = this.NEW_USER.userName
                  this.testObj.office = this.NEW_USER.userType === 'OFFICE_STAFF'?this.NEW_USER.officeId.code:null
                  this.testObj.user_type = this.NEW_USER.userType
                  this.testObj.status = this.NEW_USER.status
                  this.newUserReset();
                }) ;
              }     
              this.loading = false;                                      
            })               
        } catch (error) {
          console.log('error',error)
        }
        this.loading = false;
      },      

      async deleteUser(param){
        try {

          dialog.confirm(this.$q,"Confirmation","Would you like to delete "+param.email+"?")
          .onOk(async() => {
              this.loading = true;
              let response = await api.deleteUser(param);
              console.log('deleteUser',response)          
              if(response.error){
                dialog.negative(this.$q,response.error.data.status,response.error.data.message)           
              }else{
                dialog.positive(this.$q,response.status,response.message).onOk(()=>{
                  this.queryUserList();
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

      showUpdateUserDialog(row){
        this.testObj = row;
        let tmp = {...row};
        this.NEW_USER.email = tmp.email;
        this.NEW_USER.userName = tmp.username;
        this.NEW_USER.userType = tmp.user_type;
        this.NEW_USER.officeId = this.offices.find((office)=> office.id === tmp.office_id);
        this.NEW_USER.email_old = tmp.email;
        this.NEW_USER.status = tmp.status;
        this.newUserDialog = true;
      },

      newUserReset(){
        this.NEW_USER={
              email:null,
              userName:null,
              userType:null,
              officeId:null,
              email_old:null,
              status:null,
            }
            this.newUserDialog = false;
      }
    },
    data(){
      return {
        testObj:{},
        filter:"",
        loading:false,
        newUserDialog:false,
        rules: {
                noSpace: v => (!v?.includes(' ')) || "No space allowed.",
                notEmpty:(v) => (v && v.replaceAll(' ','').length > 0) ||  "Empty Value.",
                noSpaceStart:(v) => (v && v.charAt(0) != ' ') || "No space allowed at start",
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
            NEW_USER:{
              email:null,
              userName:null,
              userType:null,
              officeId:null,
              email_old:null,
              status:null,
            },
        offices:[],
        header : [
            {
              name: 'email',
              label: 'Email',
              align: 'left',
              field: 'email',
              sortable: true
            },
            {
              name: 'userName',
              label: 'Fullname',
              align: 'left',
              field: 'username',
              sortable: true
            },
            {
              name: 'userType',
              label: 'User Type',
              align: 'left',
              field: 'user_type',
              sortable: true
            },
            {
              name: 'office',
              label: 'Office',
              align: 'left',
              field: 'office',
              sortable: true
            },
            {
              name: 'status',
              label: 'Status',
              align: 'left',
              field: 'status',
              sortable: true
            },
            {
              name: 'action',
              label: 'Action',
              align: 'center',
            },
          ],
        userlist:[],
      };
    },
    mounted(){
      this.queryOffices();
      this.queryUserList();
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
  