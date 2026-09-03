<template>
    <div>
      <q-dialog v-model="dialogVisible">
        <q-card>
          <q-card-section>
            <q-form @submit.prevent="submitForm">
              <q-input
                v-model="id"
                label="ID"
                outlined
                dense
                clearable
              />
              <q-input
                v-model="name"
                label="Name"
                outlined
                dense
                clearable
              />
              <q-input
                v-model="email"
                label="Email"
                outlined
                dense
                clearable
              />
              <div class="q-mt-md q-gutter-md">
                <q-btn
                  label="Cancel"
                  color="primary"
                  @click="cancelForm"
                />
                <q-btn
                  label="Submit"
                  color="primary"
                  type="submit"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    setup(_,{emit}) {
      const dialogVisible = ref(false);
      const id = ref('');
      const name = ref('');
      const email = ref('');

      const notifyParentToOpenDialog = () => {
      emit('open-dialog');
        };
  
      const openDialog = () => {
        dialogVisible.value = true;
      };
  
      const cancelForm = () => {
        dialogVisible.value = false;
        // Optionally reset form fields here
        id.value = '';
        name.value = '';
        email.value = '';
      };
  
      const submitForm = () => {
        // Handle form submission here
        console.log('ID:', id.value);
        console.log('Name:', name.value);
        console.log('Email:', email.value);
  
        // Optionally, you can perform form validation before submission
  
        // Close the dialog
        dialogVisible.value = false;
  
        // Reset form fields
        id.value = '';
        name.value = '';
        email.value = '';
      };
  
      return {
        notifyParentToOpenDialog,
        dialogVisible,
        id,
        name,
        email,
        openDialog,
        cancelForm,
        submitForm,
      };
    },
  };
  </script>
  