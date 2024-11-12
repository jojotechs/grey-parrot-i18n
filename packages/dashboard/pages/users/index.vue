<script setup lang="ts">
definePageMeta({
  validate: (route) => {
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

// 表格排序
const sort = ref({
  column: 'id',
  direction: 'asc'
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-medium">用户管理</h2>
    </div>

      <UTable
        :rows="users"
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
  </div>
</template> 
