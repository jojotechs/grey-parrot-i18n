<script setup lang="ts">
import dayjs from 'dayjs'

const { sheets, error, languageMap } = useSheets()
const { data: currentUser } = useAuth()

// 表格过滤和分页
const { searchQuery, currentPage, filteredItems: filteredSheets, pageSize } = useTableFilter(sheets, 6)

// 错误提示
if (error.value) {
  useToast().add({
    title: '获取多语言表失败',
    description: error.value.message,
    color: 'red',
  })
}

// 计算是否有写权限
const canWrite = computed(() => 
  currentUser.value?.role === 'admin' || currentUser.value?.role === 'editor'
)

// 格式化日期
function formatDate(date: string | number | Date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>

<template>
  <div class="space-y-4">
    <!-- 头部 -->
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-medium">多语言表</h2>
      <div class="flex items-center gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="搜索多语言表..."
          icon="i-heroicons-magnifying-glass-20-solid"
        />
        <UButton
          v-if="canWrite"
          color="primary"
          icon="i-heroicons-plus"
          to="/sheets/create"
        >
          新建多语言表
        </UButton>
      </div>
    </div>

    <!-- 多语言表网格 -->
    <div v-if="filteredSheets.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
      <UCard
        v-for="sheet in filteredSheets"
        :key="sheet.id"
        class="flex flex-col"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-medium truncate">{{ sheet.name }}</h3>
            <UDropdown
              v-if="canWrite"
              :items="[
                [
                  {
                    label: '编辑',
                    icon: 'i-heroicons-pencil-square-20-solid',
                    to: `/sheets/${sheet.id}/edit`,
                  },
                  {
                    label: '导出',
                    icon: 'i-heroicons-arrow-down-tray-20-solid',
                    to: `/sheets/${sheet.id}/export`,
                  }
                ],
                [
                  {
                    label: '删除',
                    icon: 'i-heroicons-trash-20-solid',
                    color: 'red',
                    to: `/sheets/${sheet.id}/delete`,
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
          </div>
        </template>

        <div class="flex-1 space-y-2">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ sheet.description || '暂无描述' }}
          </p>
          
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="lang in sheet.languages"
              :key="lang"
              :label="languageMap[lang] || lang"
              size="sm"
            />
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>更新于 {{ formatDate(sheet.updatedAt) }}</span>
            <UButton
              to="`/sheets/${sheet.id}`"
              color="primary"
              variant="ghost"
              size="xs"
            >
              查看详情
            </UButton>
          </div>
        </template>
      </UCard>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-12 text-gray-500">
      <div class="i-heroicons-document-text text-4xl mb-4" />
      <p class="text-lg">暂无多语言表</p>
      <p class="text-sm mb-4">还没有创建任何多语言表</p>
      <UButton
        v-if="canWrite"
        color="primary"
        icon="i-heroicons-plus"
        to="/sheets/create"
      >
        新建多语言表
      </UButton>
    </div>

    <!-- 分页 -->
    <div v-if="filteredSheets.length" class="flex justify-center mt-4">
      <UPagination
        v-model="currentPage"
        :page-count="pageSize"
        :total="sheets?.length"
      />
    </div>
  </div>
</template> 