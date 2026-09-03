import { defineStore } from 'pinia';

export const useUidStore = defineStore('uid', {
  state: () => ({
    uid: '',
  }),
  getters: {
    doubleCount: (state) => state.uid = '2',
  },
  actions: {
    set(x) {
      this.uid = x;
    },
  },
});
