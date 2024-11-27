<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const props = defineProps<{
  modelValue: boolean
  languages: string[]
  sheetId: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { languageMap } = useSheets()
const loading = ref(false)

// 表单验证 schema
const schema = z.object({
  text: z.string().min(1, '请输入文案'),
  currentLanguage: z.string().min(1, '请选择当前语言'),
})

type FormState = z.infer<typeof schema>

// 表单状态
const state = reactive<FormState>({
  text: '',
  currentLanguage: props.languages[0] || '',
})

// 语言选项
const languageOptions = computed(() => 
  props.languages.map(lang => ({
    value: lang,
    label: languageMap[lang] || lang,
  }))
)

// 表单引用
const form = ref()

// 提交处理
async function onSubmit(event: FormSubmitEvent<FormState>) {
  try {
    loading.value = true

    // 将文本按行分割成数组
    const textArray = event.data.text
      .split('\n')
      .map(t => t.trim())
      .filter(t => t)

    if (!textArray.length) {
      useToast().add({
        title: '请输入有效的文案',
        color: 'red',
      })
      return
    }

    const response = await $fetch(`/api/sheets/${props.sheetId}/entry`, {
      method: 'PUT',
      body: {
        text: textArray,
        currentLanguage: event.data.currentLanguage,
      },
    })

    if (!response.success) {
      throw new Error(response.errors?.join('\n'))
    }

    useToast().add({
      title: '添加成功',
      description: `成功添加 ${response.entries.length} 条文案`,
      color: 'green',
    })

    // 重置表单
    state.text = ''
    state.currentLanguage = props.languages[0] || ''

    // 关闭弹窗
    emit('update:modelValue', false)

    // 刷新父组件数据
    await refreshNuxtData()
  }
  catch (error: any) {
    useToast().add({
      title: '添加失败',
      description: error.message || '请稍后重试',
      color: 'red',
    })
  }
  finally {
    loading.value = false
  }
}

// 取消处理
function handleCancel() {
  // 重置表单状态
  state.text = ''
  state.currentLanguage = props.languages[0] || ''
  // 关闭弹窗
  emit('update:modelValue', false)
}

// 监听弹窗关闭，重置表单
watch(() => props.modelValue, (val) => {
  if (!val) {
    state.text = ''
    state.currentLanguage = props.languages[0] || ''
  }
})
</script>

<template>
  <UModal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UCard>
      <template #header>
        <div class="text-lg font-medium">添加条目</div>
      </template>

      <UForm
        ref="form"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormGroup
          name="currentLanguage"
          label="当前语言"
          required
        >
          <USelect
            v-model="state.currentLanguage"
            :options="languageOptions"
            placeholder="请选择当前文案的语言"
          />
        </UFormGroup>

        <UFormGroup
          name="text"
          label="文案"
          required
        >
          <UTextarea
            v-model="state.text"
            :rows="8"
            placeholder="请输入文案，每行一条"
          />
          <template #help>
            <p class="text-xs text-gray-500">每行一条文案，将被分别翻译成其他语言</p>
          </template>
        </UFormGroup>

        <div class="flex justify-end gap-2">
          <UButton
            color="gray"
            variant="soft"
            @click="handleCancel"
          >
            取消
          </UButton>
          <UButton
            type="submit"
            color="primary"
            :loading="loading"
          >
            确认
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template> 