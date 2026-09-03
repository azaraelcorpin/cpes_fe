<template>
  <!-- <div style="color:white;display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; position: relative;" class="bg"> -->
    <div class="fullscreen bg text-white text-center q-pa-md flex flex-center">
      <q-inner-loading :showing="loading"
        label="Please wait..."
        label-class="text-black"
        label-style="font-size: 1.1em"
        color="black"
       style="z-index: 1000;" >
      </q-inner-loading>
    <div style=" align-items: center; justify-content: center;position: absolute; top: 20px; font-size: 48px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: bold; color: black;">
      Mindanao State University
    </div>
      <div  style="position: absolute;margin-bottom: 30%;  font-size: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: bold; color: black;">
      Strategic Performance Monitoring System
      </div>
      <div  style="position: absolute;margin-bottom: -30%;" >
        <q-btn @click="test('hr@msugensan.edu.ph')">
          test HR
        </q-btn>
        <q-btn @click="test('admin@msugensan.edu.ph')">
          test ADMIN
        </q-btn>     
        <q-btn @click="test('office_staff@msugensan.edu.ph')">
          test office Staff
        </q-btn>             
        <q-btn @click="test('pmt@msugensan.edu.ph')">
          test PMT
        </q-btn>         
      </div>      
    
    <GoogleLogin clientId="247346265934-ksi885k87vtrcqh7tvmcgeca9fvqr0fd.apps.googleusercontent.com" :callback="callback"/>

  </div>
</template>


<script>
import { GoogleLogin } from 'vue3-google-login';
import { decodeCredential } from 'vue3-google-login';
import { useRouter } from 'vue-router'
import { useCookies } from "vue3-cookies";
import { useQuasar } from 'quasar'
import api from "src/API/api";
import { ref } from 'vue';
import myDialog from 'src/plugins/myDialog';



export default{
  name:'LandingPage',
  components:{
    GoogleLogin
  },
  setup(){
          const loading = ref(false);
          const $q = useQuasar()
          const { cookies } = useCookies();
          const router = useRouter();
          const callback = async (response) => {
            // This callback will be triggered when the user selects or login to
            // his Google account from the popup
            console.log('gmail',response)
            loading.value=true;
            const userData = decodeCredential(response.credential)
            let SID = {};
            SID.userEmail = userData.email;
            SID.name = userData.name;
            SID.picture = userData.picture;    
            console.log(!SID.userEmail.includes('@msugensan.edu.ph'))
            if(!SID.userEmail.includes('@msugensan.edu.ph'))
              {
                myDialog.negative($q,'Unauthorized','Account Not Found')
                loading.value=false;
              }
              else{
                try {         
                  let response = await api.generateSessionId(SID);   
                  console.log('reso',response)              
                  if(response.error){
                    if(response.error.response)
                    throw new Error(response.error.response.data.message);
                    throw new Error(response.error.message);
                  }
                  if(response.status === 'OK'){
                      let sid=response.session.sessionId;
                      SID.sid=sid
                      cookies.set('_UID_',JSON.stringify(SID),'1d'); 
                      // put in localStorage the userRoles from response ↓↓↓
                      // localStorage.clear();
                      // localStorage.setItem("userRoles",JSON.stringify('[DEV]'))    

                      localStorage.clear();
                      localStorage.setItem("userRoles",JSON.stringify(response.session.ROLES))    
                      localStorage.setItem("officesAndRoles",JSON.stringify(response.session.officesAndRoles))                
                  }
                      router.push({ path: 'dashboard'})
                      loading.value=false;
                      window.location.reload();
                } catch (error) { 
                  console.log('reso',error) 
                  loading.value=false;
                  myDialog.negative($q,'Error',error.message)

                }
              }
          };
          const test = async (email) => {
            // This callback will be triggered when the user selects or login to
            // his Google account from the popup
            loading.value=true;
            let SID = {};
            SID.userEmail = email;
            SID.name = email.replaceAll('@msugensan.edu.ph','');
            SID.picture = null;    
            console.log(!SID.userEmail.includes('@msugensan.edu.ph'))
            if(!SID.userEmail.includes('@msugensan.edu.ph'))
              {
                myDialog.negative($q,'Unauthorized','Account Not Found')
                loading.value=false;
              }
              else{
                try {         
                  let response = await api.generateSessionId(SID);   
                  console.log('reso',response)              
                  if(response.error){
                    if(response.error.response)
                    throw new Error(response.error.response.data.message);
                    throw new Error(response.error.message);
                  }
                  if(response.status === 'OK'){
                      let sid=response.session.sessionId;
                      SID.sid=sid
                      cookies.set('_UID_',JSON.stringify(SID),'1d'); 
                      // put in localStorage the userRoles from response ↓↓↓
                      // localStorage.clear();
                      // localStorage.setItem("userRoles",JSON.stringify('[DEV]'))    

                      localStorage.clear();
                      localStorage.setItem("userRoles",JSON.stringify(response.session.ROLES))
                      let tmp = JSON.stringify(response.session.officesAndRoles);
                      if(tmp)    
                        localStorage.setItem("officesAndRoles",tmp)                
                  }
                      router.push({ path: 'dashboard'})
                      loading.value=false;
                      window.location.reload();
                } catch (error) { 
                  console.log('reso',error) 
                  loading.value=false;
                  myDialog.negative($q,'Error',error.message)

                }
              }
          }
          
    return{
        callback,
        test,
        router,
        cookies ,
        loading,
    }
  },
  mounted(){
    if(this.cookies.isKey('_UID_')){
      this.router.push({name:'dashboard'})
    }
  }
}

</script>

<style>
  .bg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: url( '../assets/bgt.png') no-repeat center center;
    background-size: cover;
  }
</style>