<template>
  <router-view v-if="$route.name === 'signIn'" />
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
