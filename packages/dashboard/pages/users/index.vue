<script setup lang="ts">
definePageMeta({
  title: '用户管理',
  validate: () => {
    const { data } = useAuth()
    return data.value?.role === 'admin'
  }
})

// 表格列定义
const columns = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
  },
  {
    key: 'email',
    label: '邮箱',
  },
  {
    key: 'role',
    label: '角色',
    sortable: true,
  },
  {
    key: 'actions',
    label: '操作',
  }
]

// 获取用户列表数据
const { data: users, error } = await useFetch('/api/users')

// 如果获取失败，显示错误信息
if (error.value) {
  useToast().add({
    title: '获取用户列表失败',
    description: error.value?.message,
    color: 'red',
  })
}

// 角色映射
const roleMap: Record<string, string> = {
  admin: '管理员',
  reader: '只读用户',
  editor: '编辑者'
}

// 搜索相关
const searchQuery = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 根据搜索过滤并分页的用户数据
const filteredUsers = computed(() => {
  let result = users.value || []
  
  // 搜索过滤
  if(searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user => 
      user.email.toLowerCase().includes(query) || 
      roleMap[user.role].toLowerCase().includes(query)
    )
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  
  return result.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  if(!users.value) return 0
  return Math.ceil(users.value.length / pageSize.value)
})

// 修改角色相关
const isEditingRole = ref(false)
const editingUser = ref<typeof users.value[0] | null>(null)
const selectedRole = ref<string>('')

const roleOptions = [
  { value: 'admin', label: '管理员' },
  { value: 'editor', label: '编辑者' },
  { value: 'reader', label: '只读用户' },
]

const { data: currentUser } = useAuth()

async function handleEditRole(user: typeof users.value[0]) {
  // 检查是否是最后一个管理员
  if (user.role === 'admin') {
    const adminCount = users.value?.filter(u => u.role === 'admin').length || 0
    if (adminCount <= 1) {
      useToast().add({
        title: '无法修改角色',
        description: '系统必须保留至少一个管理员',
        color: 'red',
      })
      return
    }
  }

  editingUser.value = user
  selectedRole.value = user.role
  isEditingRole.value = true
}

async function updateRole() {
  if (!editingUser.value) return

  try {
    await $fetch(`/api/users/${editingUser.value.id}/role`, {
      method: 'PUT',
      body: {
        role: selectedRole.value,
      },
    })

    // 刷新用户列表
    await refresh()

    useToast().add({
      title: '修改成功',
      color: 'green',
    })
  }
  catch (error: any) {
    useToast().add({
      title: '修改失败',
      description: error.data?.message || '请稍后重试',
      color: 'red',
    })
  }
  finally {
    isEditingRole.value = false
    editingUser.value = null
  }
}

// 删除用户相关
const isConfirmingDelete = ref(false)
const deletingUser = ref<typeof users.value[0] | null>(null)

async function handleDelete(user: typeof users.value[0]) {
  // 不能删除自己
  if (user.id === currentUser.value?.id) {
    useToast().add({
      title: '无法删除',
      description: '不能删除自己的账号',
      color: 'red',
    })
    return
  }

  // 检查是否是最后一个管理员
  if (user.role === 'admin') {
    const adminCount = users.value?.filter(u => u.role === 'admin').length || 0
    if (adminCount <= 1) {
      useToast().add({
        title: '无法删除',
        description: '系统必须保留至少一个管理员',
        color: 'red',
      })
      return
    }
  }

  deletingUser.value = user
  isConfirmingDelete.value = true
}

async function confirmDelete() {
  if (!deletingUser.value) return

  try {
    await $fetch(`/api/users/${deletingUser.value.id}`, {
      method: 'DELETE',
    })

    // 刷新用户列表
    await refresh()

    useToast().add({
      title: '删除成功',
      color: 'green',
    })
  }
  catch (error: any) {
    useToast().add({
      title: '删除失败',
      description: error.data?.message || '请稍后重试',
      color: 'red',
    })
  }
  finally {
    isConfirmingDelete.value = false
    deletingUser.value = null
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-medium">用户管理</h2>
      
      <!-- 搜索框 -->
      <UInput
        class="m-1"
        v-model="searchQuery"
        placeholder="搜索用户..."
        icon="i-heroicons-magnifying-glass-20-solid"
      />
    </div>

    <UTable
      :rows="filteredUsers"
      :columns="columns"
    >
      <!-- 角色列自定义渲染 -->
      <template #role-data="{ row }">
        <UBadge
          :color="row.role === 'admin' ? 'primary' : row.role === 'editor' ? 'yellow' : 'gray'"
          :label="roleMap[row.role]"
          size="sm"
        />
      </template>

      <!-- 操作列 -->
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
        :page-count="totalPages"
        :total="users?.length"
      />
    </div>

    <!-- 修改角色对话框 -->
    <UModal v-model="isEditingRole">
      <UCard>
        <template #header>
          <div class="text-lg font-medium">修改角色</div>
        </template>

        <div class="space-y-4">
          <p>修改 {{ editingUser?.email }} 的角色</p>
          <USelect
            v-model="selectedRole"
            :options="roleOptions"
          />
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="gray"
              variant="soft"
              @click="isEditingRole = false"
            >
              取消
            </UButton>
            <UButton
              color="primary"
              @click="updateRole"
            >
              确认
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- 删除确认对话框 -->
    <UModal v-model="isConfirmingDelete">
      <UCard>
        <template #header>
          <div class="text-lg font-medium">确认删除</div>
        </template>

        <div class="space-y-4">
          <p>确定要删除用户 {{ deletingUser?.email }} 吗？</p>
          <p class="text-sm text-red-500">此操作不可恢复！</p>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="gray"
              variant="soft"
              @click="isConfirmingDelete = false"
            >
              取消
            </UButton>
            <UButton
              color="red"
              @click="confirmDelete"
            >
              确认删除
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template> 
