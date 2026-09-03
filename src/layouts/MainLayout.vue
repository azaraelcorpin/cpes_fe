<template>
  <q-layout view="lHh Lpr lFf">
    <q-header reveal elevated>
      <q-toolbar style="background-color: #636060;">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <div :style="{marginLeft:miniState?'0':'150px'}">
            <div v-if="$q.screen.width >= 550" >Strategic Performance Management System</div>
            <div v-else >SPMS</div>
          </div>
        </q-toolbar-title>
        <q-btn @click="asDev(true)">
          asDev
        </q-btn>
        <q-btn @click="asDev(false)">
          notDev
        </q-btn>
        <q-btn   padding="0" round >
          <q-avatar size="40px" v-if="$route.name !== 'signIn'" >
                  <img v-if="cookies.isKey('_UID_') && cookies.get('_UID_').picture" :src="profilePicture()">
                  <q-icon name="person"/>
          </q-avatar>
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column items-center">
                <q-avatar size="72px">
                  <img v-if="cookies.isKey('_UID_') && cookies.get('_UID_').picture" :src="profilePicture()">
                  <q-icon name="person"/>
                </q-avatar>
                <div class="text-subtitle1 q-mt-md q-mb-xs">{{ cookies.isKey('_UID_')?cookies.get('_UID_').name:'Un Identified' }}</div>
                <div >{{ cookies.isKey('_UID_')?cookies.get('_UID_').userEmail:'Un Identefied' }}</div>
                <q-btn
                  color="black"
                  label="Logout"
                  push
                  size="sm"
                  v-close-popup
                  @click="signOut"
                ></q-btn>
              </div>
            </div>
          </q-menu>
        </q-btn>        
      </q-toolbar>
    </q-header>

    <!-- display App Version -->
    <q-footer reveal elevated style="background-color: #520608;">
        <q-toolbar class="justify-between">
          <div>MSU GenSan - ICTO</div>
          <div>SPMS v{{ $version}}</div>
        </q-toolbar>
        
      </q-footer>

      <!-- This Configuration for Drawer with no mini state and not over lay -->
      <!-- <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      
      :width="250"
      :breakpoint="500"
      bordered
      class="drawer-with-bg"
    >       -->

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above

      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      mini-to-overlay

      :width="250"
      :breakpoint="500"
      bordered
      class="drawer-with-bg"
    >
     <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
      <q-list padding>
          <q-item v-ripple to="/">
            <q-avatar square>
              <img src="~assets/MSU_Gensan_logo.png">
            </q-avatar>
              <q-item-section style="margin-left: 5px; color: white;">
                <strong>MSU-GENSAN</strong>
              </q-item-section>
            </q-item>
            
            <div v-for="item in routes" :key="item.path" link>
              <div v-if="item.visible && checkRoles(item.meta.roles)">
                <q-item v-if="!item.children" clickable v-ripple :to="item.path">
                  <q-item-section avatar>
                    <q-icon :name="item.icon" />
                  </q-item-section>

                  <q-item-section>
                    {{ item.meta.title }}
                  </q-item-section>
                </q-item>
              
                <div v-else>
                  <q-expansion-item  
                    :model-value="$route.matched.find(x => x.name === item.name)?true:false"
                    :content-inset-level="0.3" 
                    expand-separator 
                    :icon="item.icon" 
                    :label="item.meta.title" 
                    :to="item.path"
                    expand-icon-class="text-white"
                    >
                      <div  v-for="child in item.children" :key="child.path" link>
                        <q-item v-if="child.visible" clickable v-ripple :to="child.path">
                          <q-item-section avatar>
                            <q-icon :name="child.icon" />
                          </q-item-section>

                          <q-item-section>
                            {{ child.meta.title }}
                          </q-item-section>
                        </q-item>
                      </div>
                </q-expansion-item>
                
              </div>
              </div>
            </div>
      </q-list>
    </q-scroll-area>
    </q-drawer>

    <q-page-container >
      <div class="custom"></div>
      <Transition 
        name="fade-transform"
        mode="out-in"
      >
        <KeepAlive>
            <slot/>
        </KeepAlive>
      </Transition>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onMounted,onBeforeUnmount, computed} from 'vue'
import routes from 'src/router/routes'
import { useCookies } from "vue3-cookies";
import { useRouter } from 'vue-router'


export default defineComponent({
  name: 'MainLayout',

  components: {
  },

  setup () {
    const leftDrawerOpen = ref(false)
    const miniState = ref(true)
    const { cookies } = useCookies();
    const router = useRouter();
    let intervalId;
    const monitorCookie = () => {
      intervalId = setInterval(() => {
        console.log('Monitoring',cookies.isKey('_UID_'))
        if(!cookies.isKey('_UID_')){ 
              localStorage.clear();               
              router.push({name:'signIn'});
        }
      }, 5000); // Check every second
    };
    onMounted(() => {
      monitorCookie();
    });

    // Clear the interval on component unmount to prevent memory leaks
    onBeforeUnmount(() => {
      clearInterval(intervalId);
    });
    return {
      routes,
      router,
      leftDrawerOpen,
      miniState,
      cookies,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
    }
  },
  methods:{
    signOut(){
      this.cookies.remove('_UID_');
      this.router.push({name:'signIn'});
      localStorage.clear();
    },
    profilePicture(){
      if(this.cookies.isKey('_UID_')){
        if(this.cookies.get('_UID_').picture){
          return this.cookies.get('_UID_').picture
        }
      }
      return "https://cdn.quasar.dev/img/avatar4.jpg";
    }, 
    // Define the function to check user roles
    checkRoles(roles) {
      const requiredRoles = roles;
      // Check if the route has required roles defined in its meta property
      if (requiredRoles && requiredRoles.length > 0) {
        // Check if the user has the required role
        // next(false);
        const userRoles = JSON.parse(localStorage.getItem('userRoles')); // Assuming you store user roles in localstorage
        const hasRequiredRole =userRoles?requiredRoles.some(role => userRoles.includes(role)):null;
        const ImDev = localStorage.getItem('ImDev');
        if (hasRequiredRole || ImDev) {
          // User has the required role, allow access to the route
          return true;
        } else {
          // User does not have the required role, deny access or redirect to an access denied page
          return false;  
        }
      } else {
        // No specific roles required for this route, allow access
        return true;
      }
    },
    
    asDev(param){
      if(param)
        localStorage.setItem("ImDev", "hashem")
      else
        localStorage.removeItem("ImDev");
    }   

  },
})
</script>
<style>
.drawer-with-bg {
  background-image: url('../assets/bg.jpeg');
  background-size: cover;
  background-repeat: no-repeat;
  color: white;
  /* Add any other styling you need */
}
.drawer-with-bg.active {
  color: #12e246; /* Bright blue font color for active elements */
}
.custom {
  /* Fixed position */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  /* Background color with opacity */
  background-color: rgba(255, 0, 0, 0.5); /* Red color with 50% opacity */

  /* Other styles */
  width: 400px; /* Set the width as needed */
  height: 400px; /* Set the height as needed */
  text-align: center; /* Optional: Center text horizontally */

  /* Z-index */
  z-index: 1; /* Adjust the z-index as needed */
  pointer-events: none;
  background: url( '../assets/MSU_Gensan_logo.png') no-repeat center center;
  background-size: cover;
  opacity: 0.1;
  
}

</style>