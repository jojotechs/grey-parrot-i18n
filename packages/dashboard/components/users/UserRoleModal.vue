<script setup lang="ts">
import type { User } from '~/server/utils/drizzle'

const props = defineProps<{
  modelValue: boolean
  user: User | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [role: string]
}>()

const { roleOptions } = useUsers()
const selectedRole = ref(props.user?.role || '')

function handleSave() {
  emit('save', selectedRole.value)
}
</script>

<template>
  <UModal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UCard>
      <template #header>
        <div class="text-lg font-medium">修改角色</div>
      </template>

      <div class="space-y-4">
        <p>修改 {{ user?.email }} 的角色</p>
        <USelect
          v-model="selectedRole"
          :options="roleOptions"
        />
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
            color="primary"
            @click="handleSave"
          >
            确认
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template> 