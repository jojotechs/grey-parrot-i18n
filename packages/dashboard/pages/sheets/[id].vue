<script setup lang="ts">
import dayjs from 'dayjs'
import EntryAddModal from '~/components/sheets/EntryAddModal.vue'

definePageMeta({
  auth: true,
})

const route = useRoute()
const { data: currentUser } = useAuth()
const { getSheet, getSheetEntries } = useSheets()

// 获取数据
const { data: sheet } = await useAsyncData(`sheet-${route.params.id}`,
  () => getSheet(Number(route.params.id))
)

const { data: entries, refresh: refreshEntries } = await useAsyncData(`entries-${route.params.id}`,
  () => getSheetEntries(Number(route.params.id)) || []
)

// 计算是否有写权限
const canWrite = computed(() => 
  currentUser.value?.role === 'admin' || currentUser.value?.role === 'editor'
)

// 表格列定义
const columns = computed(() => {
  if (!sheet.value) return []

  return [
    {
      key: 'key',
      label: 'KEY',
    },
    ...sheet.value.languages.map(lang => ({
      key: `translations.${lang}`,
      label: lang,
    })),
    {
      key: 'updatedAt',
      label: '更新时间',
      sortable: true,
    },
    {
      key: 'actions',
      label: '操作',
    },
  ]
})

// 表格排序
const sort = ref<{
  column: string,
  direction: 'desc' | 'asc'
}>({
  column: 'updatedAt',
  direction: 'desc',
})

// 格式化日期
function formatDate(date: string | number | Date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 添加条目相关
const isAddingEntry = ref(false)
</script>

<template>
  <div class="space-y-4">
    <!-- 头部 -->
    <div class="flex justify-between items-center">
      <div class="space-y-1">
        <h2 class="text-lg font-medium">{{ sheet?.name }}</h2>
        <p class="text-sm text-gray-500">{{ sheet?.description }}</p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          v-if="canWrite"
          color="primary"
          icon="i-heroicons-plus"
          @click="isAddingEntry = true"
        >
          {{$tt('添加条目')}}
        </UButton>
        <UButton
          v-if="canWrite"
          color="primary"
          variant="soft"
          icon="i-heroicons-pencil-square"
          :to="`/sheets/edit/${route.params.id}`"
        >
          编辑
        </UButton>
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-arrow-left"
          to="/sheets"
        >
          返回
        </UButton>
      </div>
    </div>

    <!-- 语言标签 -->
    <div class="flex flex-wrap gap-2">
      <UBadge
        v-for="lang in sheet?.languages"
        :key="lang"
        :label="lang"
        size="sm"
      />
    </div>

    <!-- 条目表格 -->
    <UCard>
      <UTable
        v-model:sort="sort"
        :rows="entries || []"
        :columns="columns"
      >
        <template #updatedAt-data="{ row }">
          {{ formatDate(row.updatedAt) }}
        </template>

        <template #actions-data="{ row }">
          <UDropdown
            v-if="canWrite"
            :items="[
              [
                {
                  label: '编辑',
                  icon: 'i-heroicons-pencil-square-20-solid',
                  to: `/sheets/${route.params.id}/entries/${row.id}/edit`,
                }
              ],
              [
                {
                  label: $tt('删除'),
                  icon: 'i-heroicons-trash-20-solid',
                  to: `/sheets/${route.params.id}/entries/${row.id}/delete`,
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

        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 gap-3">
            <span class="italic text-sm">{{$tt('暂无条目')}}</span>
            <UButton
              v-if="canWrite"
              :label="$tt('添加条目')"
              @click="isAddingEntry = true"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- 添加条目弹窗 -->
    <EntryAddModal
      v-if="sheet"
      v-model="isAddingEntry"
      :languages="sheet.languages"
      :sheet-id="Number(route.params.id)"
      @success="refreshEntries"
    />
  </div>
</template> 