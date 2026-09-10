
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

  //#region Evaluation Management 
  
{
  path: '/manage-evaluations',
    name: 'manageEvaluations',
    meta: {
      title: 'Evaluation Management',
      roles: []
    },
    icon: 'assignment',
    visible: true,
    children: [
            // 1. The Management List Page
              {
                path:'/course-evaluations',
                name:'manageCourseEvaluations',
                component: () => import('pages/course_eval/ManageCourseEvaluations.vue'),
                meta: {
                  title: 'Course Evaluations',
                  roles: []
                },
                icon: 'assignment',
                visible: true,
              },

              // 2. The Dedicated Details Workspace Page (Registered separately)
              {
                path: '/manage-evaluations/:id',
                name: 'evaluationDetails',
                component: () => import('pages/course_eval/EvaluationDetails.vue'),
                meta: {
                  title: 'Evaluation Details',
                  roles: []
                },
                icon: 'analytics',
                visible: false, // Set to false so it does not show up as a raw link in your main sidebar menu
              },
            ]
},
//#endregion Evaluation Management
  ///SysAdmin
  {
    path: '/sysadm',
    name:'sysadm',
    meta:{
      title:'System Admin',
      roles:['admin']
    },
    icon:'settings',
    visible:true,
    children:[
      {
        path: '/user',
        component: () => import('pages/cpes_settings/UserMgt.vue'),
        meta:{
          title:'Users',
          roles:['admin']
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
          title:'Evaluation Templates',
        },
        icon:'settings',
        visible:true,
      },
      // schedule settings  
      {
        path: '/schedule-settings',
        component: () => import('pages/cpes_settings/ScheduleSetting.vue'),
        meta:{
          title:'Schedule Settings',
        },
        icon:'calendar_today',
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
