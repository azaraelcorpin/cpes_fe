
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';
import { useCookies } from "vue3-cookies";
import axios from 'axios'
const api_url = process.env.VUE_APP_API_URL;

const { cookies } = useCookies();
export default {
  async getAuthorization(route, _data) {
    if(!route){
      return null;
    }
    
   if(!_data){
    if(!cookies.get('_UID_')){
          cookies.remove('_UID_');
          localStorage.removeItem('routeParams');
          Swal.fire({
            title: 'The Session Timed Out',
            text: 'Please log in again',
            icon: 'error',
            confirmButtonText: 'OK'
          }).then((result) => {
            if (result.isConfirmed) {
              return
            }
          });          
      return null;
    }
    else{
      _data = cookies.get('_UID_');
    }
  }
  _data.route = route;
     let key = process.env.VUE_APP_KEY;
    key = CryptoJS.enc.Utf8.parse(key); // replace with your own secret key
    let iv = CryptoJS.lib.WordArray.random(16); // generate a random 16-byte IV
    const jsonData = JSON.stringify( _data??(cookies.get('_UID_')));
    const encryptedData = CryptoJS.AES.encrypt(jsonData, key,  {iv} ).toString();    
    return {
      headers:{
        'X-IV': iv.toString(CryptoJS.enc.Base64),
        Authorization:'Bearer '+ encryptedData,
      } 
    }
  },

  validateResponse(error){
    let response = error.response
    console.log('res',response.data.message)
    if(response){
      if(response.data && response.data.statusCode === '401'){    
        localStorage.removeItem('routeParams');
        Swal.fire({
          title: 'Unauthorized',
          text: response.data.message +' Please log in again',
          icon: 'error',
          confirmButtonText: 'OK',
          allowOutsideClick:false,
          timer:5000,
        })
        setTimeout(function() {
          cookies.remove('_UID_');
        }, 1000); // 5000 milliseconds = 5 seconds         
      }
    }else{
      Swal.fire({
        title: error.name,
        text: error.message,
        icon: 'error',
        confirmButtonText: 'OK',
        allowOutsideClick:false,
      })
    }
    
  },

  //NOTE: getAuthorization() requires a route parameter to be passed in order to validate the session. If the route parameter is not provided, the function will return null and not perform any authorization checks.

    ///// generate session Id
    async generateSessionId(SID) {
      var path = '/api/cpes-setting/users/getSessionId'
      var url = `${api_url}${path}`
      console.log('SID',SID)
      const config = await this.getAuthorization(path,SID);
      console.log('config',config)
      const body = {}
      try { 
        const response = await axios.post(url, body, config);
        console.log('response',response)
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('generatedSessionId Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },  

// get all users
    async getAllUsers() {
      var path = '/api/cpes-setting/users'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = {}
      try {   
        const response = await axios.post(url, body, config);

        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('getAllUsers Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    /**
     * @param {String} pdate
     * @returns String Date with timezone en-US
     */
    dateEN_US(pdate){
      const date = new Date(pdate); // Replace this with your desired date

        const options = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 3, // Milliseconds with 3 digits
          timeZoneName: 'short', // Add 'Z' for UTC
        };

        const formattedDate = new Intl.DateTimeFormat('en-US', options).formatToParts(date);

        // Create the desired format 'yyyy-MM-dd'T'HH:mm:ss.SSS'Z''
        return `${formattedDate[4].value}-${formattedDate[0].value}-${formattedDate[2].value}T${formattedDate[6].value}:${formattedDate[8].value}:${formattedDate[10].value}.${formattedDate[12].value}Z`;
    },

}
