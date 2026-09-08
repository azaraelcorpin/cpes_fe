
const routes = [
  ///Home
  {
    path: '/',
    name:'home',
    component: () => import('pages/IndexPage.vue'),
    meta:{
      title:'Home',
      roles:[]
    },
    icon:'home',
    visible:false,
  },
  ///Dashboard
  {
    path: '/dashboard',
    name:'dashboard',
    component: () => import('pages/sysAdmin/SysAdmin.vue'),
    meta:{
      title:'Dashboard',
      roles:[]
    },
    icon:'dashboard',
    visible:true,
  },

  ///SysAdmin
  {
    path: '/sysadm',
    name:'sysadm',
    component: () => import('pages/sysAdmin/SysAdmin.vue'),
    meta:{
      title:'System Admin',
      roles:['ADMIN']
    },
    icon:'settings',
    visible:true,
    children:[
      {
        path: '/user',
        component: () => import('pages/cpes_settings/UserMgt.vue'),
        meta:{
          title:'Users',
        },
        icon:'manage_accounts',
        visible:true,
      },
      {
        path: '/rating-scales',
        component: () => import('pages/cpes_settings/RatingScaleSetting.vue'),
        meta:{
          title:'Rating Scales',
        },
        icon:'star',
        visible:true,
      },
      {
        path: '/evaluation-settings',
        component: () => import('pages/cpes_settings/EvaluationSetting.vue'),
        meta:{
          title:'Evaluation Settings',
        },
        icon:'settings',
        visible:true,
      },  
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    name:'catchAll',
    component: () => import('pages/ErrorNotFound.vue'),
    meta:{
      title:'Not Found',
    },
    icon:'error',
    visible:false,
  },
  {
    path: '/accessDenied',
    name:'accessDenied',
    component: () => import('pages/accessDenied.vue'),
    meta:{
      title:'Denied',
    },
    icon:'error',
    visible:false,
  }, 
  
  ///Sign In
  {
    path: '/signIn',
    name:'signIn',
    component: () => import('pages/LandingPage.vue'),
    meta:{
      title:'Sign In',
    },
    visible:false,
  }
]

export default routes

/**
 * for icons sets
 *  https://material.io/icons/
 */
