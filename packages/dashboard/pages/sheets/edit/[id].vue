<script setup lang="ts">
// 添加认证元数据
definePageMeta({
  validate: () => {
    const { data } = useAuth()
    return data.value?.role === 'admin' || data.value?.role === 'editor'
  }
})

import { sheetSchema, type SheetFormData } from '~/server/schemas/sheet'
import LanguageSelect from '~/components/sheets/LanguageSelect.vue'
import type { FormSubmitEvent } from '#ui/types'

const route = useRoute()
const router = useRouter()
const { getSheet, createSheet, updateSheet } = useSheets()

// 判断是否是编辑模式
const isEdit = computed(() => route.params.id !== 'create')

// 使用 zod schema 进行表单验证
const schema = sheetSchema

// 表单引用
const formRef = ref()

// 表单状态
const state = reactive<SheetFormData>({
  name: '',
  description: '',
  languages: [],
})

// 获取数据时更新状态
onMounted(async () => {
  if (isEdit.value) {
    try {
      const sheet = await getSheet(Number(route.params.id))
      state.name = sheet?.name || ''
      state.description = sheet?.description || ''
      state.languages = sheet?.languages || []
    }
    catch (error: any) {
      useToast().add({
        title: '获取数据失败',
        description: error.data?.message || '请稍后重试',
        color: 'red',
      })
      router.push('/sheets')
    }
  }
})

// 提交处理
async function onSubmit(event: FormSubmitEvent<SheetFormData>) {
  try {
    if (isEdit.value) {
      await updateSheet(Number(route.params.id), event.data)
      useToast().add({ title: '更新成功', color: 'green' })
    }
    else {
      await createSheet(event.data)
      useToast().add({ title: '创建成功', color: 'green' })
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

    <UForm
      ref="formRef"
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormGroup
        name="name"
        label="表名"
        required
      >
        <UInput
          v-model="state.name"
          placeholder="请输入表名"
        />
      </UFormGroup>

      <UFormGroup
        name="description"
        label="描述"
      >
        <UTextarea
          v-model="state.description"
          placeholder="请输入描述"
        />
      </UFormGroup>

      <UFormGroup
        name="languages"
        label="支持的语言"
        required
      >
        <LanguageSelect
          v-model="state.languages"
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
    </UForm>
  </UCard>
</template> 