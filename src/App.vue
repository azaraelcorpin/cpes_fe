<template>
  <router-view v-if="$route.name === 'signIn'" />
  <router-view v-else-if="$route.name === 'studentEnrolledCourses'" />
  <main-layout v-else>
      <router-view />
  </main-layout>
</template>

<script>
import { defineComponent,watch } from 'vue'
import MainLayout from './layouts/MainLayout.vue';


export default defineComponent({
    name: 'App',
    components:{
      MainLayout,
    },
})
</script>
