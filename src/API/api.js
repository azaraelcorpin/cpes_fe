
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';
import { useCookies } from "vue3-cookies";
import axios from 'axios'

const { cookies } = useCookies();
const api_url = process.env.VUE_APP_SPMS_API_URL;
export default {
  async getAuthorization(_data){
    
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
  }
     let key = process.env.VUE_APP_PCR_KEY;
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


  ///// test 
  async test(userEmail) {
    var url = api_url+'/user/all'
    const config = await this.getAuthorization(userEmail);
    const body = { }
    try {      
      const response = await axios.post(url, body, config);      
      if (response && response.data && response.status == 200) {
        return response.data;
      } else{
        console.log(response);
        return {error:response}
      }
    } catch (error) {
      console.log(error.response);
      this.validateResponse(error.response)
      return { error: error.response }
    }
  },

    ///// generate session Id
    async generateSessionId(userEmail) {
      var url = api_url+'/user/getSessionId'
      const config = await this.getAuthorization(userEmail);
      const body = { }
      try {      
        const response = await axios.post(url, body, config);
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

        ///// new User
    async newUser(param) {
      var url = api_url+'/user/new'
      const config = await this.getAuthorization();
      const body = {
        email:param.email,
        userName:param.userName,
        userType:param.userType,
        officeId:param.userType === 'OFFICE_STAFF'? param.officeId.id:null,
        privileges:param.privileges,
       }
      try {      
        const response = await axios.post(url, body, config);
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('newUser Error');
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        return { error: error.response }
      }
    },  

    //// update User
    async updateUser(param) {
      var url = api_url+'/user/update'
      const config = await this.getAuthorization();
      const body = {
        email:param.email,
        userName:param.userName,
        userType:param.userType,
        officeId:param.userType === 'OFFICE_STAFF'? param.officeId.id:null,
        privileges:param.privileges,
        status:param.status,
        email_old:param.email_old,
       }
      try {      
        const response = await axios.post(url, body, config);
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('Update User Error');
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        return { error: error.response }
      }
    },      

       ///// Delete User
    async deleteUser(param) {
      var url = api_url+'/user/delete'
      const config = await this.getAuthorization();
      const body = {
        email:param.email,
       }
      try {      
        const response = await axios.post(url, body, config);
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('newUser Error');
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        return { error: error.response }
      }
    },  

    ///// getAllUser 
    async getAllUser() {
      var url = api_url+'/user/all'
      const config = await this.getAuthorization();
      const body = { }
      try {      
        const response = await axios.post(url, body, config);      
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log(response);
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        this.validateResponse(error)
        return { error: error.response }??error
      }
    },    

    ///// getAllOffice 
    async getAllOffice() {
      var url = api_url+'/office/all'
      const config = await this.getAuthorization();
      const body = { }
      try {      
        const response = await axios.post(url, body, config);      
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log(response);
          return {error:response}
        }
      } catch (error) {
        console.log(error);
        this.validateResponse(error)
        return { error: error.response }??error
      }
    },   
    
    ///// getOfficeData
    async getOfficeData(id) {
      var url = api_url+'/office/getOfficeData'
      const config = await this.getAuthorization();
      const body = { 
        id:id
      }
      try {      
        const response = await axios.post(url, body, config);      
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log(response);
          return {error:response}
        }
      } catch (error) {
        console.log(error);
        this.validateResponse(error)
        return { error: error.response }??error
      }
    },  

    ///// new User
    async newOffice(param) {
      var url = api_url+'/office/new'
      const config = await this.getAuthorization();
      const body = {
        code:param.code,
        description:param.description,
        is_sector:param.is_sector.val,
        topOfficeId:param.hasTopOffice?param.topOfficeId.id:null,
        }
      try {      
        const response = await axios.post(url, body, config);
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('newOffice Error');
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        return { error: error.response }
      }
    },      

    //// update Office
    async updateOffice(param) {
      var url = api_url+'/office/update'
      const config = await this.getAuthorization();
      const body = {
        id:param.id,
        code:param.code,
        description:param.description,
        is_sector:param.is_sector.val,
        topOfficeId:param.hasTopOffice?param.topOfficeId.id:null,
        }
      try {      
        const response = await axios.post(url, body, config);
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('Update Office Error');
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        return { error: error.response }
      }
    },       
    
    ///// Delete Office
    async deleteOffice(param) {
      var url = api_url+'/office/delete'
      const config = await this.getAuthorization();
      const body = {
        id:param.id,
        }
      try {      
        const response = await axios.post(url, body, config);
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('deleteOffice Error');
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        return { error: error.response }
      }
    },  

    ///// getAllPcrSchedule 
    async getAllPcrSchedule() {
      var url = api_url+'/pcr_schedule/all'
      const config = await this.getAuthorization();
      const body = { }
      try {      
        const response = await axios.post(url, body, config);      
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log(response);
          return {error:response}
        }
      } catch (error) {
        console.log(error);
        this.validateResponse(error)
        return { error: error.response }??error
      }
    },    

    ///// new PCR SCHED
    async newSched(param) {
      var url = api_url+'/pcr_schedule/new'
      const config = await this.getAuthorization();
      const body = {
        dateStart:this.dateEN_US(param.dateStart),
        dateEnd:this.dateEN_US(param.dateEnd),
        }
      try {      
        const response = await axios.post(url, body, config);
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('newScedule Error');
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        return { error: error.response }
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

    ///// update PCR SCHED
    async updateSched(param) {
      var url = api_url+'/pcr_schedule/update'
      console.log(this.dateEN_US(new Date()))
      const config = await this.getAuthorization();
      const body = {
        dateStart:this.dateEN_US(param.dateStart),
        dateEnd:this.dateEN_US(param.dateEnd),
        id:param.id,
        status:param.status,
        }
        console.log('@Body',param)
      try {      
        const response = await axios.post(url, body, config);
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('Update Schedule Error');
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        return { error: error.response }
      }
    },      

    ///// Delete Sched
    async deleteSched(param) {
      var url = api_url+'/pcr_schedule/delete'
      const config = await this.getAuthorization();
      const body = {
        id:param.id,
        }
      try {      
        const response = await axios.post(url, body, config);
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('delete Sched Error');
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        return { error: error.response }
      }
    },      

    ///// new Employee
    async newEmployee(param) {
      var url = api_url+'/employee/new'
      const config = await this.getAuthorization();
      const body = {
        lname:param.lname,
        fname:param.fname,
        mname:param.mname,
        email:param.email,
        }
      try {      
        const response = await axios.post(url, body, config);
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('newEmployee Error');
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        return { error: error.response }
      }
    },  

    //// update Employee
    async updateEmployee(param) {
      var url = api_url+'/employee/update'
      const config = await this.getAuthorization();
      const body = {
        id:param.id, 
        lname:param.lname,
        fname:param.fname,
        mname:param.mname,
        email:param.email,
        }
      try {      
        const response = await axios.post(url, body, config);
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('Update Employee Error');
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        return { error: error.response }
      }
    },      

        ///// Delete Employee
    async deleteEmployee(param) {
      var url = api_url+'/employee/delete'
      const config = await this.getAuthorization();
      const body = {
        id:param.id,
        }
      try {      
        const response = await axios.post(url, body, config);
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log('DelEmployee Error');
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        return { error: error.response }
      }
    },  

    ///// getAllEmployee 
    async getAllEmployee() {
      var url = api_url+'/employee/all'
      const config = await this.getAuthorization();
      const body = { }
      try {      
        const response = await axios.post(url, body, config);      
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log(response);
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        this.validateResponse(error)
        return { error: error.response }??error
      }
    },    

    ///// searchEmployee 
    async searchEmployee(val) {
      var url = api_url+'/employee/search'
      const config = await this.getAuthorization();
      const body = {
        empName:val
       }
      try {      
        const response = await axios.post(url, body, config);      
        if (response && response.data && response.status == 200) {
          return response.data;
        } else{
          console.log(response);
          return {error:response}
        }
      } catch (error) {
        console.log(error.response);
        this.validateResponse(error)
        return { error: error.response }??error
      }
    },     
}
