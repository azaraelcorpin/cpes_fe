
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

    //#region Users and Rating Scales API

// get all users
    async getAllUsers() {
      var path = '/api/cpes-setting/users'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = {}
      try {
        const response = await axios.post(url, body, config);

        if (response && response.data && response.data.success) {
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

// get Users by role
    async getUsersByRole(role) {
      var path = '/api/cpes-setting/users/getUsersByRole'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = {role:role}
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('getUsersByRole Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

// create user
    async createUser(user) {
      var path = '/api/cpes-setting/users/create'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = user
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('createUser Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    // update user
    async updateUser(user) {
      var path = '/api/cpes-setting/users/update'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = user
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('updateUser Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    //. get all rating scales
    async getAllRatingScales() {
      var path = '/api/cpes-setting/rating-scales'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = {}
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('getAllRatingScales Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    // get all academic terms
    async getAllAcademicTerms() {
      var path = '/api/cpes-setting/acad-terms'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      try {
        const response = await axios.post(url, {}, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('getAllAcademicTerms Error');
          return { error: response }
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error }
      }
    },

    // get academic term by id
    async getAcademicTermById(id) {
      var path = '/api/cpes-setting/acad-terms/getById'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      try {
        const response = await axios.post(url, { id: id }, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('getAcademicTermById Error');
          return { error: response }
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error }
      }
    },

    // create academic term
    async createAcademicTerm(term) {
      var path = '/api/cpes-setting/acad-terms/create'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      try {
        const response = await axios.post(url, term, config);
        if (response && response.data && (response.data.success || response.status === 201)) {
          return response.data;
        } else {
          console.log('createAcademicTerm Error');
          return { error: response }
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error }
      }
    },

    // update academic term
    async updateAcademicTerm(term) {
      var path = '/api/cpes-setting/acad-terms/update'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      try {
        const response = await axios.post(url, term, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('updateAcademicTerm Error');
          return { error: response }
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error }
      }
    },

    // delete academic term
    async deleteAcademicTerm(id) {
      var path = '/api/cpes-setting/acad-terms/delete'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      try {
        const response = await axios.post(url, { id: id }, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('deleteAcademicTerm Error');
          return { error: response }
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error }
      }
    },

    //update rating scale
    async updateRatingScale(scale) {
      var path = '/api/cpes-setting/rating-scales/update'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = scale
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('updateRatingScale Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    // create rating scale profile
    async createRatingScaleProfile(profile) {
      var path = '/api/cpes-setting/rating-scales/createProfile'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = profile
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('createRatingScaleProfile Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    // update rating scale profile
    async updateRatingScaleProfile(profile) {
      var path = '/api/cpes-setting/rating-scales/updateProfile'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = profile
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('updateRatingScaleProfile Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    //get rating scale profile by id
    async getRatingScaleProfileById(id) {
      var path = '/api/cpes-setting/rating-scales/getById'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = { _id: id }
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('getRatingScaleProfileById Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    //#endregion Users and Rating Scales API

    //#region Evaluation Settings API
    async createEvaluationTemplate(evaluation) {
      var path = '/api/cpes-setting/evaluations/create'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = evaluation
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('createEvaluationTemplate Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    async getAllEvaluationTemplates() {
      var path = '/api/cpes-setting/evaluations'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = {}
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('getAllEvaluationTemplates Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    async updateEvaluationTemplate(evaluation) {
      var path = '/api/cpes-setting/evaluations/update'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = evaluation
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('updateEvaluationTemplate Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    async getEvaluationTemplateProfile(evaluationId) {
      var path = '/api/cpes-setting/indicators/getAllByEvaluationId'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = { _id: evaluationId }
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('getEvaluationTemplateProfile Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    async updateEvaluationTemplateProfile(evaluation) {
      var path = '/api/cpes-setting/indicators/saveAllByEvaluationId'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = evaluation
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('updateEvaluationTemplateProfile Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },
 //#endregion Evaluation Settings API

    //#region course_eval API
    async getAllEvaluations() {
      var path = '/api/course-eval/evaluations'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = {}
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('getAllEvaluations Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    // get template of evaluation from 'cpes-setting/evaluations/getActiveByType'
    async getEvaluationTemplateByType(type) {
      var path = '/api/cpes-setting/evaluations/getActiveByType'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = { type: type }
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('getEvaluationTemplateByType Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    async createEvaluation(payload){
      var path = '/api/course-evaluation/evaluations/create'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = payload  
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('getEvaluationTemplateByType Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    async deleteEvaluation(id){
      var path = '/api/course-evaluation/evaluations/delete'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = { _id: id }  
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('deleteEvaluation Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    async getEvaluations(){
      var path = '/api/course-evaluation/evaluations'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = {}  
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('getEvaluationTemplateByType Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },    

    async getByEvaluation_Id(id){
      var path = '/api/course-evaluation/evaluations/getEvaluationFormDetails'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = { _id: id }
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('getByEvaluation_Id Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    async getEvaluationFormDetailsByCourseCode(course_code){
      var path = '/api/course-evaluation/evaluations/getEvaluationFormDetailsByCourseCode'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = { course_code: course_code }
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('getByEvaluation_Id Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },    

    async updateEvaluation(payload){
      var path = '/api/course-evaluation/evaluations/update'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = payload  
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else{
          console.log('getEvaluationTemplateByType Error');
          return {error:response}
        }
      } catch (error) {
        console.log('error',error.message);
        return { error:error }
      }
    },

    async createEvaluationItem(payload){
      var path = '/api/course-evaluation/evaluation-items/create'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      try {
        const response = await axios.post(url, payload, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('createEvaluationItem Error');
          return { error: response }
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error }
      }
    },

    async updateEvaluationItem(payload){
      var path = '/api/course-evaluation/evaluation-items/update'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      try {
        const response = await axios.post(url, payload, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('updateEvaluationItem Error');
          return { error: response }
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error }
      }
    },

    async deleteEvaluationItem(id){
      var path = '/api/course-evaluation/evaluation-items/delete'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      try {
        const response = await axios.post(url, { _id: id }, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('deleteEvaluationItem Error');
          return { error: response }
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error }
      }
    },

    async createEvaluationMember(payload){
      var path = '/api/course-evaluation/action-members/create'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      try {
        const response = await axios.post(url, payload, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('createEvaluationMember Error');
          return { error: response }
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error }
      }
    },

    async deleteEvaluationMember(id){
      var path = '/api/course-evaluation/action-members/delete'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      try {
        const response = await axios.post(url, { _id: id }, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('deleteEvaluationMember Error');
          return { error: response }
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error }
      }
    },
    
    //get evaluation members by evaluation id
    async getEvaluationMembersByEvaluationId(evaluationId){
      var path = '/api/course-evaluation/action-members/getAllByEvaluationId'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      try {
        const response = await axios.post(url, { evaluation_id: evaluationId }, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('getEvaluationMembersByEvaluationId Error');
          return { error: response }
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error }
      }
    },

    //deleteIndicatorsByEvaluationId
    async deleteIndicatorsByEvaluationId(evaluationId){
      var path = '/api/course-evaluation/indicators/deleteByEvaluationId'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      try {
        const response = await axios.post(url, { evaluation_id: evaluationId }, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('deleteIndicatorsByEvaluationId Error');
          return { error: response }
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error }
      }
    },

    //postResponseWithItems
    async postResponseWithItems(payload){
      var path = '/api/course-evaluation/responses/postResponseWithItems'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      try {
        const response = await axios.post(url, payload, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('postResponseWithItems Error');
          return { error: response }
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error }
      }
    },

    //getResponseWithItems
    async getResponseWithItems(evaluationId){
      var path = '/api/course-evaluation/responses/getResponseWithItemsByEvaluationId'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = {
        evaluation_id: evaluationId,
      }
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('getResponseWithItems Error');
          return { error: response };
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error };
      }
    },

    //getResponseStatistics
    async getResponseStatistics(evaluationId){
      var path = '/api/course-evaluation/responses/getResponseStatistics'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = {
        evaluation_id: evaluationId,
      }
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('getResponseStatistics Error');
          return { error: response };
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error };
      }
    },

    //getCommentsByEvaluationId
    async getCommentsByEvaluationId(evaluationId){
      var path = '/api/course-evaluation/responses/getCommentsByEvaluationId'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = {
        evaluation_id: evaluationId,
      }
      try {
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('getCommentsByEvaluationId Error');
          return { error: response };
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error };
      }
    },


    //#endregion course_eval API


    //#region sais-ext queries
    async getDepartmentWithSubjects(acad_year,semCode){
      var path = '/api/sais-ext/getDepartmentWithSubjects'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = {
        acad_year,
        semCode
      }
      try{
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('getDepartmentWithSubjects Error');
          return { error: response };
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error };
      }
    },

    //getFacultiesWithDepartments
    async getFacultiesWithDepartments(dept_code){
      var path = '/api/sais-ext/getFacultiesWithDepartments'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = {dept_code}
      try{
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('getFacultiesWithDepartments Error');
          return { error: response };
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error };
      }
    },

    //getEnrolledCoursesByEnrollmentId
    async getEnrolledCoursesByEnrollmentId(enrollmentId){
      var path = '/api/sais-ext/getEnrolledCoursesByEnrollmentId'
      var url = `${api_url}${path}`
      const config = await this.getAuthorization(path);
      const body = {enrollmentId: enrollmentId}
      try{
        const response = await axios.post(url, body, config);
        if (response && response.data && response.data.success) {
          return response.data;
        } else {
          console.log('getEnrolledCoursesByEnrollmentId Error');
          return { error: response };
        }
      } catch (error) {
        console.log('error', error.message);
        return { error: error };
      }
    },

    //#endregion sais-ext
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
