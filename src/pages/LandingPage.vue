<template>
  <main :class="{ 'login-panel-hidden': !showLoginPanel }" class="login-page">
    <q-inner-loading :showing="loading" color="white" class="login-loading">
      <q-spinner-dots size="50px" color="white" />
      <div class="text-white q-mt-md">Signing you in...</div>
    </q-inner-loading>

    <section class="login-intro" @click="showLoginPanel = true">
      <div class="intro-shade"></div>
      <q-btn
        flat
        round
        dense
        class="panel-toggle"
        :icon="showLoginPanel ? 'arrow_forward' : 'arrow_back'"
        :aria-label="showLoginPanel ? 'Hide sign-in panel' : 'Show sign-in panel'"
        @click.stop="showLoginPanel = !showLoginPanel"
      />
      <div class="intro-content">
        <div class="brand-lockup">
          <img class="brand-mark" src="~assets/MSU_Gensan_logo.png" alt="MSU GenSan seal" />
          <div>
            <div class="brand-kicker">Mindanao State University</div>
            <div class="brand-campus">General Santos</div>
          </div>
        </div>
        <div class="intro-copy">
          <div class="eyebrow">Academic quality, made visible</div>
          <h1>Course &amp; Program<br />Evaluation System</h1>
          <p>One place for thoughtful feedback, clear insights, and better learning experiences.</p>
        </div>
        <div class="intro-footer">MSU-Gensan &nbsp;·&nbsp; ICTO</div>
      </div>
    </section>

    <section :class="{ 'login-panel-hidden': !showLoginPanel }" class="login-panel">
      <div class="login-card">
        <div class="mobile-brand">MSU <span>GENSAN</span></div>
        <div class="panel-heading">
          <div class="panel-overline">Welcome back</div>
          <h2>Sign in to CPES</h2>
          <p>Use your official MSU account to continue.</p>
        </div>

        <div class="field-label">Your role</div>
        <q-select
          v-model="role"
          :options="[
            { label: 'Administrator', value: 'admin' },
            { label: 'Student', value: 'student' },
            { label: 'Faculty', value: 'faculty' },
            { label: 'Chairperson', value: 'chairperson' },
            { label: 'Dean', value: 'dean' },
            { label: 'VCAA / CCSID', value: 'admin' }
          ]"
          outlined
          emit-value
          map-options
          behavior="menu"
          popup-content-class="role-menu"
          class="role-select"
          aria-label="Select your role"
        >
          <template #prepend><q-icon name="badge" /></template>
        </q-select>

        <div class="signin-divider"><span>secure access</span></div>
        <div class="google-login-wrap">
          <GoogleLogin
            clientId="247346265934-ksi885k87vtrcqh7tvmcgeca9fvqr0fd.apps.googleusercontent.com"
            :callback="callback"
          />
        </div>
        <p class="account-note"><q-icon name="lock" size="14px" /> Only @msugensan.edu.ph accounts are accepted</p>

        <q-expansion-item label="Developer access" icon="terminal" dense class="developer-access">
          <div class="developer-grid">
            <q-btn outline dense label="HR" @click="test('hr@msugensan.edu.ph')" />
            <q-btn outline dense label="Admin" @click="test('admin@msugensan.edu.ph')" />
            <q-btn outline dense label="Office staff" @click="test('office_staff@msugensan.edu.ph')" />
            <q-btn outline dense label="PMT" @click="test('pmt@msugensan.edu.ph')" />
          </div>
        </q-expansion-item>
      </div>
      <div class="panel-footer">CPES <span>v2026</span></div>
    </section>
  </main>
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
      const showLoginPanel = ref(true);
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
            SID.email = userData.email;
            SID.name = userData.name;
            SID.picture = userData.picture;
            SID.role = role.value;
            console.log(!SID.email.includes('@msugensan.edu.ph'))
            if(!SID.email.includes('@msugensan.edu.ph'))
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
                  if(response.success){
                      let sid=response.data;

                      cookies.set('_UID_',JSON.stringify(sid),'1d');
                      // put in localStorage the userRoles from response ↓↓↓
                      // localStorage.clear();
                      // localStorage.setItem("userRoles",JSON.stringify('[DEV]'))

                      localStorage.clear();
                      localStorage.setItem("userRoles",JSON.stringify(sid.role))
                      if(sid.dept_code)
                        localStorage.setItem("dept_code",JSON.stringify(sid.dept_code))
                      if(sid.college_code)
                        localStorage.setItem("college_code",JSON.stringify(sid.college_code))
                      localStorage.setItem("dept_code",JSON.stringify('ABM'))
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
          const role = ref('admin');

    return{
        callback,
        test,
        router,
        cookies ,
        loading,
        showLoginPanel,
        role,
    }
  },
  mounted(){
    if(this.cookies.isKey('_UID_')){
      this.router.push({name:'dashboard'})
    }
  }
}

</script>

<style scoped>
  .login-page {
    --ink: #202124;
    --maroon: #650b0e;
    --gold: #d9a441;
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(380px, 0.85fr);
    background: #f7f5f2;
    color: var(--ink);
    font-family: Georgia, 'Times New Roman', serif;
    overflow: hidden;
    transition: grid-template-columns .85s cubic-bezier(.34, 1.56, .64, 1);
  }
  .login-page.login-panel-hidden { grid-template-columns: minmax(0, 1fr) 0; }
  .login-intro { position: relative; min-height: 100vh; background: url('../assets/bgt.png') center / cover no-repeat; overflow: hidden; cursor: default; }
  .login-page.login-panel-hidden .login-intro { cursor: pointer; }
  .intro-shade { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(42, 4, 5, .86) 0%, rgba(92, 7, 10, .48) 46%, rgba(27, 25, 25, .12) 100%); }
  .panel-toggle { position: absolute; top: 24px; right: 24px; z-index: 3; color: white; background: rgba(42, 4, 5, .34); border: 1px solid rgba(255, 255, 255, .34); backdrop-filter: blur(8px); }
  .panel-toggle:hover { background: rgba(42, 4, 5, .62); }
  .intro-content { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; padding: clamp(32px, 6vw, 84px); color: white; }
  .brand-lockup { display: flex; align-items: center; gap: 16px; }
  .brand-mark { display: block; width: 72px; height: 72px; flex: 0 0 72px; object-fit: contain; filter: drop-shadow(0 8px 12px rgba(0, 0, 0, .2)); }
  .brand-kicker { font-size: clamp(18px, 2vw, 25px); font-weight: bold; letter-spacing: .01em; }
  .brand-campus { margin-top: 3px; color: #f2cf80; font: 600 11px/1.2 Arial, sans-serif; letter-spacing: .18em; text-transform: uppercase; }
  .intro-copy { max-width: 640px; margin-top: 12vh; }
  .eyebrow, .panel-overline { color: var(--gold); font: 700 11px/1.2 Arial, sans-serif; letter-spacing: .2em; text-transform: uppercase; }
  h1 { margin: 18px 0; font-size: clamp(42px, 5.5vw, 78px); line-height: .98; letter-spacing: -.03em; }
  .intro-copy p { max-width: 410px; margin: 0; color: rgba(255, 255, 255, .78); font: 16px/1.6 Arial, sans-serif; }
  .intro-footer { color: rgba(255, 255, 255, .65); font: 11px Arial, sans-serif; letter-spacing: .18em; text-transform: uppercase; }
  .login-panel { display: flex; flex-direction: column; justify-content: center; padding: 7vh clamp(28px, 7vw, 100px); background: #f7f5f2; overflow: hidden; opacity: 1; transform: translateX(0) scale(1); filter: blur(0); visibility: visible; will-change: opacity, transform, filter; transition: opacity .42s ease, transform .85s cubic-bezier(.34, 1.56, .64, 1), filter .5s ease, visibility 0s linear 0s; }
  .login-panel.login-panel-hidden { opacity: 0; transform: translateX(100%) scale(.98); filter: blur(3px); visibility: hidden; pointer-events: none; transition: opacity .35s ease, transform .85s cubic-bezier(.34, 1.56, .64, 1), filter .5s ease, visibility 0s linear .85s; }
  .login-card { width: 100%; max-width: 430px; margin: auto; }
  .mobile-brand { display: none; color: var(--maroon); font: 700 14px Arial, sans-serif; letter-spacing: .16em; }
  .mobile-brand span { color: #8f8b83; }
  .panel-heading { margin-bottom: 38px; }
  h2 { margin: 10px 0 8px; color: var(--ink); font-size: clamp(32px, 4vw, 46px); line-height: 1; letter-spacing: -.03em; }
  .panel-heading p { margin: 0; color: #77736d; font: 14px/1.5 Arial, sans-serif; }
  .field-label { margin-bottom: 8px; color: #55514b; font: 700 12px Arial, sans-serif; letter-spacing: .04em; }
  .role-select :deep(.q-field__control) { height: 54px; border-radius: 3px; background: rgba(255, 255, 255, .58); }
  .role-select :deep(.q-field__native), .role-select :deep(.q-field__marginal) { color: var(--ink); }
  .role-select :deep(.q-field__control:before) { border-color: #d6d0c8; }
  .role-select :deep(.q-field__control:hover:before) { border-color: var(--maroon); }
  .role-select :deep(.q-icon) { color: var(--maroon); }
  .signin-divider { display: flex; align-items: center; gap: 12px; margin: 30px 0 22px; color: #aaa49b; font: 10px Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
  .signin-divider::before, .signin-divider::after { content: ''; height: 1px; flex: 1; background: #ded9d1; }
  .google-login-wrap { display: flex; justify-content: center; min-height: 44px; }
  .account-note { display: flex; align-items: center; justify-content: center; gap: 5px; margin: 16px 0 30px; color: #918b83; font: 11px Arial, sans-serif; }
  .developer-access { border-top: 1px solid #e2ddd6; color: #7d7770; font: 12px Arial, sans-serif; }
  .developer-access :deep(.q-item) { padding: 14px 0; }
  .developer-access :deep(.q-item__section--avatar) { min-width: 28px; color: var(--maroon); }
  .developer-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 0 0 14px 28px; }
  .developer-grid .q-btn { color: var(--maroon); border-color: #cfc8bf; font-size: 11px; }
  .panel-footer { margin-top: auto; color: #a19b92; text-align: center; font: 10px Arial, sans-serif; letter-spacing: .18em; text-transform: uppercase; }
  .panel-footer span { color: #c1bbb2; }
  .login-loading { background: rgba(34, 10, 11, .8); }
  @media (max-width: 760px) {
    .login-page { display: block; overflow-y: auto; }
    .login-page.login-panel-hidden { grid-template-columns: 1fr; }
    .login-intro { min-height: 215px; }
    .intro-content { min-height: 215px; padding: 24px 26px; }
    .brand-lockup { gap: 10px; }
    .brand-mark { width: 48px; height: 48px; flex-basis: 48px; }
    .brand-kicker { font-size: 16px; }
    .brand-campus { font-size: 9px; }
    .intro-copy { margin-top: 0; }
    .intro-copy .eyebrow, .intro-copy p, .intro-footer { display: none; }
    h1 { margin: 0; font-size: 32px; }
    .login-panel { min-height: calc(100vh - 215px); padding: 36px 26px 24px; max-height: 1000px; transition: opacity .35s ease, transform .7s cubic-bezier(.34, 1.56, .64, 1), max-height .7s ease; }
    .login-panel.login-panel-hidden { max-height: 0; min-height: 0; padding-top: 0; padding-bottom: 0; }
    .mobile-brand { display: block; margin-bottom: 38px; }
    .panel-heading { margin-bottom: 30px; }
    .panel-footer { margin-top: 30px; }
  }
</style>
