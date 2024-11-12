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
              },
            ],
            [
              {
                label: '删除',
                icon: 'i-heroicons-trash-20-solid',
                color: 'red',
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
  </div>
</template> 
