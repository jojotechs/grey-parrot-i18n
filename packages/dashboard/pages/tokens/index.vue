<script setup lang="ts">
import dayjs from 'dayjs'
import { UserRole } from '~/server/database/schema'

definePageMeta({
  validate: () => {
    const { data } = useAuth()
    return data.value?.role === UserRole.Admin || data.value?.role === UserRole.Editor
  }
})

const { data: tokens, refresh } = useFetch('/api/tokens')

// 表格列定义
const columns = [
  { key: 'name', label: '名称' },
  { key: 'token', label: 'Token' },
  { key: 'expiresAt', label: '过期时间', sortable: true },
  { key: 'createdAt', label: '创建时间', sortable: true },
  { key: 'actions', label: '操作' },
]

// 新建token相关
const isCreating = ref(false)
const loading = ref(false)

const state = reactive({
  name: '',
})

// 创建token
async function handleCreate() {
  try {
    loading.value = true
    const response = await $fetch('/api/tokens', {
      method: 'POST',
      body: state,
    })

    // 复制token到剪贴板
    await navigator.clipboard.writeText(response.token)
    
    useToast().add({
      title: 'Token创建成功',
      description: 'Token已复制到剪贴板',
      color: 'green',
    })

    // 重置表单
    state.name = ''
    isCreating.value = false
    refresh()
  }
  catch (error: any) {
    useToast().add({
      title: '创建失败',
      description: error.data?.message || '请稍后重试',
      color: 'red',
    })
  }
  finally {
    loading.value = false
  }
}

// 删除token
async function handleDelete(id: number) {
  try {
    await $fetch(`/api/tokens/${id}`, {
      method: 'DELETE',
    })
    
    useToast().add({
      title: '删除成功',
      color: 'green',
    })
    
    refresh()
  }
  catch (error: any) {
    useToast().add({
      title: '删除失败', 
      description: error.data?.message || '请稍后重试',
      color: 'red',
    })
  }
}

// 格式化日期
function formatDate(date: string | number | null) {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="space-y-4">
    <!-- 头部 -->
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-medium">API Token</h2>
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        @click="isCreating = true"
      >
        新建Token
      </UButton>
    </div>

    <!-- Token列表 -->
    <UCard>
      <UTable
        :rows="tokens || []"
        :columns="columns"
      >
        <template #token-data="{ row }">
          <div class="flex items-center gap-2">
            <span class="font-mono text-sm">{{ row.token.slice(0, 8) }}...</span>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-clipboard"
              size="xs"
              @click="copyToClipboard(row.token)"
            >
              复制
            </UButton>
          </div>
        </template>

        <template #createdAt-data="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>

        <template #expiresAt-data="{ row }">
          {{ formatDate(row.expiresAt) }}
        </template>

        <template #actions-data="{ row }">
          <UButton
            color="red"
            variant="ghost"
            icon="i-heroicons-trash"
            size="xs"
            @click="handleDelete(row.id)"
          >
            删除
          </UButton>
        </template>

        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 gap-3">
            <span class="italic text-sm">暂无Token</span>
            <UButton
              label="新建Token"
              @click="isCreating = true"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- 创建Token弹窗 -->
    <UModal
      v-model="isCreating"
    >
      <UCard>
        <template #header>
          <div class="text-lg font-medium">新建Token</div>
        </template>

        <form class="space-y-4" @submit.prevent="handleCreate">
          <UFormGroup
            label="名称"
            required
          >
            <UInput
              v-model="state.name"
              placeholder="请输入Token名称"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              color="gray"
              variant="soft"
              @click="isCreating = false"
            >
              取消
            </UButton>
            <UButton
              type="submit"
              color="primary"
              :loading="loading"
            >
              创建
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>