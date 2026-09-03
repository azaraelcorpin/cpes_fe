
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
    component: () => import('components/SelectEmployee.vue'),
    meta:{
      title:'Dashboard',
      roles:[]
    },
    icon:'dashboard',
    visible:true,
  },
  ///MyPCR
  {
    path: '/myPCR',
    name:'myPCR',
    component: () => import('pages/TreeSample.vue'),
    meta:{
      title:'My PCR',
      roles:['INDIVIDUAL','OFFICE_HEAD']
    },
    icon:'person',
    visible:true,
  },
  ///MyOffice
  {
    path: '/myOffice',
    name:'myOffice',
    component: () => import('pages/TestPages.vue'),
    meta:{
      title:'My Office',
      roles:['OFFICE_HEAD','OFFICE_STAFF']
    },
    icon:'domain',
    visible:true,
    children:[
      {
        path: '/members',
        component: () => import('pages/TestPage.vue'),
        meta:{
          title:'Members',
        },
        icon:'groups',
        visible:true,
      },
      {
        path: '/preassessments',
        component: () => import('pages/TestPage.vue'),
        meta:{
          title:'Pre Assessments',
        },
        icon:'subject',
        visible:true,
      },
    ],
  },
  ////PMT
  {
    path: '/PMT',
    name:'PMT',
    component: () => import('pages/sysAdmin/SysAdmin.vue'),
    meta:{
      title:'PMT',
      roles:['PMT']
    },
    icon:'admin_panel_settings',
    visible:true,
    children:[
      {
        path: '/pcr_sched',
        component: () => import('pages/PMT/ScheduleMgt.vue'),
        meta:{
          title:'PCR Schedule',
        },
        icon:'schedule',
        visible:true,
      },
      {
        path: '/mfo',
        component: () => import('pages/sysAdmin/UserMgt.vue'),
        meta:{
          title:'MFO',
        },
        icon:'checklist',
        visible:true,
      },
      {
        path: '/commitments',
        component: () => import('pages/sysAdmin/UserMgt.vue'),
        meta:{
          title:'Commitments',
        },
        icon:'task',
        visible:true,
      },
    ],
  },
  ////HR
  {
    path: '/HR',
    name:'HR',
    component: () => import('pages/HR/HumanResource.vue'),
    meta:{
      title:'Human Resource',
      roles:['HR']
    },
    icon:'groups',
    visible:true,
    children:[
      {
        path: '/offices',
        name:'offices',
        component: () => import('pages/HR/OfficesMgt.vue'),
        meta:{
          title:'Office',
        },
        icon:'holiday_village',
        visible:true,
        children:[
          {
            path: '/offices/:id',
            name:'office',
            component: () => import('pages/HR/OfficeDetails.vue'),
            meta:{
              title:'Office Details',
              roles:['HR','OFFICE_HEAD','OFFICE_STAFF']
            },
            visible:false,  
          }
        ]
      },
      {
        path: '/employees',
        component: () => import('pages/HR/EmployeeMgt.vue'),
        meta:{
          title:'Employees',
        },
        icon:'supervisor_account',
        visible:true,
      },
    ],
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
        component: () => import('pages/sysAdmin/UserMgt.vue'),
        meta:{
          title:'Users',
        },
        icon:'manage_accounts',
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
