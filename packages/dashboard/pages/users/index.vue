<script setup lang="ts">
import type { User } from '~/server/utils/drizzle'
import UserRoleModal from '~/components/users/UserRoleModal.vue'
import UserDeleteModal from '~/components/users/UserDeleteModal.vue'

definePageMeta({
  validate: () => {
    const { data } = useAuth()
    return data.value?.role === 'admin'
  }
})

// 用户数据和操作
const { users, error, roleMap, isLastAdmin, updateUserRole, deleteUser } = useUsers()
const { data: currentUser } = useAuth()

// 表格过滤和分页
const { searchQuery, currentPage, filteredItems: filteredUsers } = useTableFilter(users)

// 表格列定义
const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'email', label: '邮箱' },
  { key: 'role', label: '角色', sortable: true },
  { key: 'actions', label: '操作' }
]

// 错误提示
if (error.value) {
  useToast().add({
    title: '获取用户列表失败',
    description: error.value.message,
    color: 'red',
  })
}

// 角色编辑相关
const isEditingRole = ref(false)
const editingUser = ref<User | null>(null)

async function handleEditRole(user: User) {
  if (isLastAdmin(user)) {
    useToast().add({
      title: '无法修改角色',
      description: '系统必须保留至少一个管理员',
      color: 'red',
    })
    return
  }

  editingUser.value = user
  isEditingRole.value = true
}

// 删除相关
const isConfirmingDelete = ref(false)
const deletingUser = ref<User | null>(null)

function handleDelete(user: User) {
  if (user.id === currentUser.value?.id) {
    useToast().add({
      title: '无法删除',
      description: '不能删除自己的账号',
      color: 'red',
    })
    return
  }

  if (isLastAdmin(user)) {
    useToast().add({
      title: '无法删除',
      description: '系统必须保留至少一个管理员',
      color: 'red',
    })
    return
  }

  deletingUser.value = user
  isConfirmingDelete.value = true
}
</script>

<template>
  <div class="space-y-4">
    <!-- 头部 -->
    <div class="flex justify-between items-center p-1">
      <h2 class="text-lg font-medium">用户管理</h2>
      <UInput
        v-model="searchQuery"
        placeholder="搜索用户..."
        icon="i-heroicons-magnifying-glass-20-solid"
      />
    </div>

    <!-- 用户表格 -->
    <UTable
      :rows="filteredUsers"
      :columns="columns"
    >
      <template #role-data="{ row }">
        <UBadge
          :color="row.role === 'admin' ? 'primary' : row.role === 'editor' ? 'yellow' : 'gray'"
          :label="roleMap[row.role]"
          size="sm"
        />
      </template>

      <template #actions-data="{ row }">
        <UDropdown
          :items="[
            [
              {
                label: '修改角色',
                icon: 'i-heroicons-pencil-square-20-solid',
                click: () => handleEditRole(row),
              },
            ],
            [
              {
                label: '删除',
                icon: 'i-heroicons-trash-20-solid',
                color: 'red',
                click: () => handleDelete(row),
              }
            ]
          ]"
        >
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-horizontal-20-solid"
          />
        </UDropdown>
      </template>
    </UTable>

    <!-- 分页 -->
    <div class="flex justify-end">
      <UPagination
        v-model="currentPage"
        :page-count="10"
        :total="users?.length"
      />
    </div>

    <!-- 对话框 -->
    <UserRoleModal
      v-model="isEditingRole"
      :user="editingUser"
      @save="role => updateUserRole(editingUser!.id, role)"
    />

    <UserDeleteModal
      v-model="isConfirmingDelete"
      :user="deletingUser"
      @confirm="() => deleteUser(deletingUser!.id)"
    />
  </div>
</template> 
