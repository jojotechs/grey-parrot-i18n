<script setup lang="ts">
import type { SheetFormData } from '~/server/schemas/sheet'
import LanguageSelect from '~/components/sheets/LanguageSelect.vue'

const route = useRoute()
const router = useRouter()
const { sheets, languageOptions, createSheet, updateSheet } = useSheets()

// 判断是否是编辑模式
const isEdit = computed(() => route.params.id !== 'create')

// 获取当前编辑的表
const currentSheet = computed(() => {
  if (!isEdit.value) return null
  return sheets.value?.find(s => s.id === Number(route.params.id))
})

// 表单数据
const form = reactive<SheetFormData>({
  name: currentSheet.value?.name || '',
  description: currentSheet.value?.description || '',
  languages: currentSheet.value?.languages || [],
})

// 提交处理
async function handleSubmit() {
  try {
    if (isEdit.value) {
      await updateSheet(Number(route.params.id), form)
      useToast().add({
        title: '更新成功',
        color: 'green',
      })
    }
    else {
      await createSheet(form)
      useToast().add({
        title: '创建成功',
        color: 'green',
      })
    }
    router.push('/sheets')
  }
  catch (error: any) {
    useToast().add({
      title: isEdit.value ? '更新失败' : '创建失败',
      description: error.data?.message || '请稍后重试',
      color: 'red',
    })
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium">
          {{ isEdit ? '编辑多语言表' : '新建多语言表' }}
        </h2>
      </div>
    </template>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <UFormGroup
        label="表名"
        required
      >
        <UInput
          v-model="form.name"
          placeholder="请输入表名"
        />
      </UFormGroup>

      <UFormGroup label="描述">
        <UTextarea
          v-model="form.description"
          placeholder="请输入描述"
        />
      </UFormGroup>

      <UFormGroup
        label="支持的语言"
        required
      >
        <LanguageSelect
          v-model="form.languages"
        />
      </UFormGroup>

      <div class="flex justify-end gap-2">
        <UButton
          color="gray"
          variant="soft"
          to="/sheets"
        >
          取消
        </UButton>
        <UButton
          type="submit"
          color="primary"
        >
          {{ isEdit ? '更新' : '创建' }}
        </UButton>
      </div>
    </form>
  </UCard>
</template> 