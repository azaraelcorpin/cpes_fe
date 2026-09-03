<template>
  <div>
    <router-view v-if="$route.matched.length >= 2" />
  <q-page v-else class="flex flex-center" style="background-color: rgb(98, 66, 240);">
   Page 2
  </q-page>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TestPages'
})
</script>
