<template>
  <div>
    <router-view v-if="$route.matched.length >= 2" />
  <q-page v-else class="flex flex-center" >
   System Administration
  </q-page>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SysAdmin'
})
</script>
