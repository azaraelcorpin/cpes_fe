
<template>
    <div >
    <h1>Basic</h1>
    <div style="  display: flex;
            justify-content: center;
            align-items: center;">
        <blocks-tree :data="treeData" :horizontal="treeOrientation=='1'"  :collapsable="true" labelClassName="bold-text"
        :props="{label: 'Description', expand: 'expand', children: 'children',  key:'some_id'}"></blocks-tree>
    </div>

    <h1>With slots</h1>
    <div style="align-content: center;">
        <blocks-tree :data="treeData" :horizontal="treeOrientation=='1'" :collapsable="true" :props="{label: 'code', expand: 'expand', children: 'children',  key:'some_id'}">
        <template #node="{data,context}">
            <span>
                <input type="checkbox" :checked="selected.indexOf(data.some_id)> -1" @change="(e)=>toggleSelect(data,e.target.checked)"/> {{data.Description}}
            </span>
            <br/>
            <span v-if="data.children && data.children.length">
                <a href="#" @click="context.toggleExpand">toggle expand</a>
            </span>
        </template>
        </blocks-tree>
        <div>
        Selected: {{selected}}
        </div>
    </div>

    <h1>Change orientation</h1>
    <select v-model="treeOrientation">
        <option value="0">Vertical</option>
        <option value="1">Horizontal</option>
    </select>
    </div>
</template>
<script>
import { defineComponent,ref,reactive } from 'vue';
import BlocksTree from 'vue3-blocks-tree'
import 'vue3-blocks-tree/dist/vue3-blocks-tree.css';

export default defineComponent({
    components:{
        BlocksTree
    },
    setup() {

        let selected = ref([]);
        let treeOrientation = ref("0");
        let treeData = reactive({
            "Description": "Office of the Chancellor",
            "code": "OC",
            "id": 1,
            "is_sector": 0,
            expand:true,
            "children": [
                {
                    "Description": "Information Communication Technology Office",
                    "code": "ICTO",
                    "id": 2,
                    "is_sector": 0,
                    expand:true,
                    "children": [
                        {
                            "Description": "System Development",
                            "code": "SysDev",
                            "id": 7,
                            "is_sector": 0
                        },
                        {
                            "Description": "Network Administration",
                            "code": "NetAdmin",
                            "id": 8,
                            "is_sector": 0
                        }
                    ]
                },
                {
                    "Description": "Human Resources Management Office",
                    "code": "HRMO",
                    "id": 3,
                    "is_sector": 0
                },
                {
                    "Description": "Finance Office",
                    "code": "FO",
                    "id": 4,
                    "is_sector": 0,
                    "children": [
                        {
                            "Description": "Accounting Office",
                            "code": "AO",
                            "id": 9,
                            "is_sector": 0
                        }
                    ]
                },
                {
                    "Description": "Student Affairs",
                    "code": "SA",
                    "id": 5,
                    "is_sector": 0,
                    expand:true,
                    "children": [
                        {
                            "Description": "Admissions Office",
                            "code": "AdmO",
                            "id": 10,
                            "is_sector": 0
                        }
                    ]
                },
                {
                    "Description": "Research and Development",
                    "code": "R&D",
                    "id": 6,
                    "is_sector": 0
                }
            ]
        });

        const toggleSelect = (node, isSelected) => {
            isSelected ? selected.value.push(node.some_id) : selected.value.splice(selected.value.indexOf(node.some_id), 1);
            if(node.children && node.children.length) {
                node.children.forEach(ch=>{
                    toggleSelect(ch,isSelected)
                })
            }
        }

        return {
            treeData,
            selected,
            toggleSelect,
            treeOrientation
        }
    }
})

</script>
<style>
.bold-text {
  font-weight: bold;
}
</style>
