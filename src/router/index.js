import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useCookies } from "vue3-cookies";
import myDialog from 'src/plugins/myDialog';
import { useQuasar } from 'quasar';

// Define the function to handle route navigation and document title changes
function handleRouteNavigationAndTitleChange(to, from, next) {
  const { cookies } = useCookies();

  document.title = process.env.VUE_APP_NAME + '-' + to.meta.title;
  
  if (to.name === 'signIn'|| to.name === 'accessDenied' || to.name === 'catchAll' || cookies.isKey('_UID_')) {
    
    if(cookies.isKey('_UID_') && !(to.name === 'signIn'|| to.name === 'accessDenied' || to.name === 'catchAll'))
      checkRoles(to,from,next)
    else
    next();
  } else {
    document.title = process.env.VUE_APP_NAME + '-' + 'Sign In';
    next({ name: 'signIn' });
  }
}

// Define the function to check user roles
function checkRoles(to, from, next) {
  const requiredRoles = to.meta.roles;
  to.meta.from = from
  // Check if the route has required roles defined in its meta property
  if (requiredRoles && requiredRoles.length > 0) {
    // Check if the user has the required role
    // next(false);
    const userRoles = JSON.parse(localStorage.getItem('userRoles')); // Assuming you store user roles in localstorage
    const hasRequiredRole =userRoles?requiredRoles.find(role => userRoles.includes(role)):null;
    const ImDev = localStorage.getItem('ImDev');
    if (hasRequiredRole || ImDev) {
      // User has the required role, allow access to the route
      next();
    } else {
      // User does not have the required role, deny access or redirect to an access denied page
      const requiredRolesFrom = from.meta.roles;
      const $q = useQuasar();
        myDialog.negative($q,"Forbidden","Access Denied on "+to.meta.title).onOk(()=>{
          let prevRouteRole = userRoles?(requiredRolesFrom??[]).some(role => userRoles.includes(role)):null;
          if(prevRouteRole)
            next(from);
          else
            next({name:'dashboard'})
        }) ;      
    }
  } else {
    // No specific roles required for this route, allow access
    next();
  }
}


/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(handleRouteNavigationAndTitleChange);

  return Router;
})
