<script setup>
import { GoogleLogin } from 'vue3-google-login';
import { decodeCredential } from 'vue3-google-login'
const callback = (response) => {
  // This callback will be triggered when the user selects or login to
  // his Google account from the popup
  console.log("Handle the response", response)
  const userData = decodeCredential(response.credential)
  console.log("Handle the userData", userData)
}
</script>

<template>
  <GoogleLogin clientId="247346265934-ksi885k87vtrcqh7tvmcgeca9fvqr0fd.apps.googleusercontent.com" :callback="callback"/>
</template>
