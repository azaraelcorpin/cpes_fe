import { boot } from 'quasar/wrappers'
import vue3GoogleLogin from 'vue3-google-login'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// const api = axios.create({ baseURL: 'https://api.example.com' })


export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  app.use(vue3GoogleLogin, 
    {clientId:'374345962676-2qhmeu03dv6ttljboatelgclf9u16p22.apps.googleusercontent.com'}
    // {
    // clientId: '374345962676-2qhmeu03dv6ttljboatelgclf9u16p22.apps.googleusercontent.com ', 
    // scope: 'email',
    // response_type: 'code', 
    // prompt: 'consent', 
    // fetch_basic_profile: true,
    // plugin_name:'SPMS client'
    // }
    )
})
