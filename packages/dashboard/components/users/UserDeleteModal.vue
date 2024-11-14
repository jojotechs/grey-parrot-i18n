<script setup lang="ts">
import type { User } from '~/server/utils/drizzle'

defineProps<{
  modelValue: boolean
  user: User | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()
</script>

<template>
  <UModal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UCard>
      <template #header>
        <div class="text-lg font-medium">确认删除</div>
      </template>

      <div class="space-y-4">
        <p>确定要删除用户 {{ user?.email }} 吗？</p>
        <p class="text-sm text-red-500">此操作不可恢复！</p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="gray"
            variant="soft"
            @click="emit('update:modelValue', false)"
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