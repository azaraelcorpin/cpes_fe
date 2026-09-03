<template>
  <q-page class="flex flex-center" style="background-color: aquamarine;">
    Dashboard
    <q-btn @click="test()">TEST</q-btn>
    <TreeChart :json="treeData" ></TreeChart>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import TreeChart from "components/TreeChart.vue";

import api from "src/API/api";

export default defineComponent({
  name: 'TestPage',
  components:{
    TreeChart
  },
  data(){
    return {
      treeData: 
         {
          name: 'root',
          image_url:  "https://lh3.googleusercontent.com/a/ACg8ocJCM1-oXNBMNh1LLPHTAKtQgIL7jsJwovvgdes2Zn2hyg=s96-c",
          class: ["rootNode"],
          children: [
            {
              name: 'children1',
              image_url: ( '../src/assets/MSU_Gensan_logo.png')
            },
            {
              name: 'children2',
              image_url: ( '../src/assets/MSU_Gensan_logo.png'),
              mate: [{
                name: 'mate',
                image_url: ( '../src/assets/MSU_Gensan_logo.png')
              }],
              children: [
                {
                  name: 'grandchild',
                  image_url:( '../src/assets/MSU_Gensan_logo.png')
                },
                {
                  name: 'grandchild2',
                  image_url:( '../src/assets/MSU_Gensan_logo.png')
                },
                {
                  name: 'grandchild3',
                  image_url: ( '../src/assets/MSU_Gensan_logo.png')
                }
              ]
            },
            {
              name: 'children3',
              image_url: ( '../src/assets/MSU_Gensan_logo.png')
            }
          ]
        }
    }
  },
  methods:{
    async test(para){
      try {
        let response = await api.test();
        console.log('response',response)
      } catch (error) {
        console.log('error',error)
      }
    }
  }
})
</script>
<!-- 
<template>
  <div style="display: grid; place-items: center;">
    <div>
      <input v-model="searchText" type="text" />
      <Tree
        :nodes="data"
        :search-text="searchText"
        show-child-count
        @nodeExpanded="onNodeExpanded"
        @update:nodes="onUpdate"
        @nodeClick="onNodeClick"
      > 
    </Tree>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import Tree from "vue3-tree";
import "vue3-tree/dist/style.css";

export default {
  components: {
    Tree,
  },
  setup() {
    const data = ref([
        {
            "Description": "Office of the Chancellor",
            "code": "OC",
            "label": "OC",
            "id": 1,
            "is_sector": 0,
            "nodes": [
                {
                    "Description": "Information Communication Technology Office",
                    "code": "ICTO",
                    "label": "ICTO",
                    "id": 2,
                    "is_sector": 0,
                    "nodes": [
                        {
                            "Description": "System Development",
                            "code": "SysDev",
                            "label": "SysDev",
                            "id": 7,
                            "is_sector": 0
                        },
                        {
                            "Description": "Network Administration",
                            "code": "NetAdmin",
                            "label": "NetAdmin",
                            "id": 8,
                            "is_sector": 0
                        }
                    ]
                },
                {
                    "Description": "Human Resources Management Office",
                    "code": "HRMO",
                    "label": "HRMO",
                    "id": 3,
                    "is_sector": 0
                },
                {
                    "Description": "Finance Office",
                    "code": "FO",
                    "label": "FO",
                    "id": 4,
                    "is_sector": 0,
                    "nodes": [
                        {
                            "Description": "Accounting Office",
                            "code": "AO",
                            "label": "AO",
                            "id": 9,
                            "is_sector": 0
                        }
                    ]
                },
                {
                    "Description": "Student Affairs",
                    "code": "SA",
                    "label": "SA",
                    "id": 5,
                    "is_sector": 0,
                    "nodes": [
                        {
                            "Description": "Admissions Office",
                            "code": "AdmO",
                            "label": "AdmO",
                            "id": 10,
                            "is_sector": 0
                        }
                    ]
                },
                {
                    "Description": "Research and Development",
                    "code": "R&D",
                    "label": "R&D",
                    "id": 6,
                    "is_sector": 0
                }
            ]
        }
    ]);
    const searchText = ref("");
    const onNodeExpanded = (node, state) => {
      console.log("state: ", state);
      console.log("node: ", node);
    };

    const onUpdate = (nodes) => {
      console.log("nodes:", nodes);
    };

    const onNodeClick = (node) => {
      console.log(node);
    };

    return {
      data,
      searchText,
      onNodeExpanded,
      onUpdate,
      onNodeClick,
    };
  },
};
</script>

<style lang="scss">
</style> -->