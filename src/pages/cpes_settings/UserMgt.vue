<template>
	<q-page class="q-pa-lg bg-grey-1">
		<div class="row items-center justify-between q-mb-lg">
			<div>
				<div class="text-h5 text-weight-medium">User Management</div>
				<div class="text-grey-7">Manage system users, roles, and access status</div>
			</div>
			<q-btn color="primary" icon="person_add" label="Add User" unelevated @click="openCreate" />
		</div>

		<q-card flat bordered>
			<!-- <q-card-section class="row q-col-gutter-md items-center">
				<q-input v-model="filter" outlined dense clearable class="col-12 col-md-5"
					placeholder="Search by full name or email">
					<template #prepend><q-icon name="search" /></template>
				</q-input>
				<q-select v-model="statusFilter" :options="statusOptions" outlined dense clearable
					label="Status" class="col-12 col-md-2" />
				<q-select v-model="roleFilter" :options="roleOptions" outlined dense clearable
					label="Role" class="col-12 col-md-2" />
				<q-space />
				<q-btn flat round icon="refresh" color="primary" @click="loadUsers">
					<q-tooltip>Refresh users</q-tooltip>
				</q-btn>
			</q-card-section> -->

			<q-separator />
			<q-table :rows="users" :columns="columns" :filter="filter" row-key="id"
				:loading="loading" flat :pagination="pagination" @request="loadUsers">
				<template #body-cell-name="props">
					<q-td :props="props">
						<div class="row items-center no-wrap">
							<q-avatar color="primary" text-color="white" size="36px" class="q-mr-sm">
								{{ initials(props.row.fullname) }}
							</q-avatar>
							<div><div class="text-weight-medium">{{ props.row.fullname }}</div></div>
						</div>
					</q-td>
				</template>
				<template #body-cell-is_primary="props">
					<q-td :props="props">
						<q-icon v-if="props.row.is_primary" name="check" color="positive" size="sm" />
						<span v-else class="text-grey-5">—</span>
					</q-td>
				</template>
				<template #body-cell-status="props">
					<q-td :props="props"><q-badge :color="props.row.status === 'ACTIVE' ? 'positive' : 'grey'"
						:label="props.row.status" /></q-td>
				</template>
				<template #body-cell-actions="props">
					<q-td :props="props" class="text-right">
						<q-btn flat round dense icon="edit" color="primary" @click="openEdit(props.row)" />
						<q-btn flat round dense :icon="props.row.status === 'ACTIVE' ? 'block' : 'check_circle'"
							:color="props.row.status === 'ACTIVE' ? 'negative' : 'positive'"
							@click="toggleStatus(props.row)">
							<q-tooltip>{{ props.row.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}</q-tooltip>
						</q-btn>
					</q-td>
				</template>
				<template #no-data><div class="full-width text-center q-pa-lg text-grey-7">No users found</div></template>
			</q-table>
		</q-card>

		<q-dialog v-model="dialog" persistent>
			<q-card style="width: 560px; max-width: 95vw">
				<q-card-section class="row items-center"><div class="text-h6">{{ editing ? 'Edit User' : 'Add User' }}</div><q-space /><q-btn v-close-popup flat round dense icon="close" /></q-card-section>
				<q-separator />
				<q-form @submit="saveUser">
					<q-card-section class="q-gutter-md">
						<q-input v-model="form.fullname" label="Full name" outlined :rules="[required]" />
						<q-input v-model="form.email" type="email" label="Email address" outlined :rules="[required]" />
						<q-select v-model="form.role" :options="roleOptions" label="Role" outlined :rules="[required]" />
						<q-toggle v-model="form.status" label="ACTIVE user" />
                        <q-toggle :disable="!isAdmin" v-model="form.is_primary" label="Primary User"  />
					</q-card-section>
					<q-card-actions align="right" class="q-pa-md"><q-btn flat label="Cancel" v-close-popup /><q-btn color="primary" label="Save" type="submit" unelevated /></q-card-actions>
				</q-form>
			</q-card>
		</q-dialog>
	</q-page>
</template>

<script>
import api from "src/API/api";
import myDialog from "src/plugins/myDialog";
import { useQuasar } from 'quasar';

export default {
	name: 'UserMgt',
    setup() {
        const $q = useQuasar();
        return { $q };
    },
	data () {
		return {
            userRoles: localStorage.getItem('userRoles') ? JSON.parse(localStorage.getItem('userRoles')) : null,
			filter: '', statusFilter: null, roleFilter: null, loading: false, dialog: false, editing: false,
			statusOptions: ['ACTIVE', 'INACTIVE'], roleOptions: ['admin', 'VCAA', 'CCSID'],
			pagination: { rowsPerPage: 10 },
			form: { id: null, fullname: '', email: '', role: 'Viewer', status: true, is_primary: false },
			users: [],
			columns: [
				{ name: 'fullname', label: 'User', field: 'fullname', align: 'left', sortable: true },
				{ name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
				{ name: 'role', label: 'Role', field: 'role', align: 'left', sortable: true },
				{ name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
				{ name: 'is_primary', label: 'Primary User', field: 'is_primary', align: 'left', sortable: true },
				{ name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
			]
		}
	},
	computed: {
		isAdmin () {
            console.log('localStorage.getItem(userRoles)',localStorage.getItem('userRoles'))
			return this.userRoles === 'admin'    
		}
	},
	methods: {
		required (value) { return !!value || 'This field is required' },
		initials (name) { return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase() },
		openCreate () { this.editing = false; this.form = { id: null, fullname: '', email: '', role: '', status: true, is_primary: false }; this.dialog = true },
		openEdit (user) { this.editing = true; this.form = { ...user, status: user.status === 'ACTIVE', is_primary: user.is_primary }; this.dialog = true },
		saveUser () { 
            const user = { ...this.form, status: this.form.status ? 'ACTIVE' : 'INACTIVE' }; 
            if (this.editing) 
                Object.assign(this.users.find(item => item.id === user.id), user); 
            else this.users.push({ ...user, id: Date.now() }); this.dialog = false; this.$q.notify({ type: 'positive', message: 'User saved successfully' }) },
		toggleStatus (user) { user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
	
    async  loadUsers(){
            try {
                
                this.loading = true;
                const response = await api.getAllUsers();
                if(response.success){
                    this.users = response.data;
                    this.loading = false;
                } else {
                    throw new Error('Failed to load users');
                }
            } catch (error) {
                console.error('Error loading users:', error);
                this.loading = false;
            }
        }
	},
    mounted() {
        this.loadUsers();
    }
}
</script>
