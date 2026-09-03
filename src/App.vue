<template>
  <!-- <router-view /> -->
  <div>
  <main-layout>
      <router-view />
   </main-layout>
   
   </div>
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
