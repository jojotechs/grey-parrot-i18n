<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  title?: string
  message?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

// 处理关闭
async function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <UModal
    :model-value="!!modelValue"
    @update:model-value="handleClose"
  >
    <UCard>
      <template #header>
        <div class="text-lg font-medium">{{ title || '确认删除' }}</div>
      </template>

      <div class="space-y-4">
        <p>{{ message ??  '' }}</p>
        <p class="text-sm text-red-500">此操作不可恢复！</p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="gray"
            variant="soft"
            @click="handleClose"
          >
            取消
          </UButton>
          <UButton
            color="red"
            @click="emit('confirm')"
          >
            确认删除
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template> 