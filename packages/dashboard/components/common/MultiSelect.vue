<script setup lang="ts">
interface Option {
  value: string
  label: string
}

const props = defineProps<{
  options: Option[]
  placeholder?: string
}>()

const model = defineModel<string[]>({
  default: () => [],
})

// 全选/取消全选
function toggleSelectAll() {
  if (model.value.length === props.options.length) {
    // 如果已经全选，则清空
    model.value = []
  }
  else {
    // 否则全选
    model.value = props.options.map(opt => opt.value)
  }
}

// 清空选择
function clearSelection() {
  model.value = []
}

// 计算全选按钮的状态
const selectAllState = computed(() => {
  if (model.value.length === 0) return '全选'
  if (model.value.length === props.options.length) return '取消全选'
  return `已选 ${model.value.length}/${props.options.length}`
})
</script>

<template>
  <div class="space-y-2">
    <!-- 选择器 -->
    <USelectMenu
      v-model="model"
      :options="options"
      multiple
      searchable
      :placeholder="placeholder"
      value-attribute="value"
      option-attribute="label"
      :ui="{
        select: {
          base: 'w-full',
        },
      }"
    >
      <template #label>
        <slot name="selected-display" :selected="model">
          <div class="flex flex-wrap gap-1">
            <template v-if="model.length">
              <UBadge
                v-for="value in model"
                :key="value"
                :label="options.find(opt => opt.value === value)?.label"
                size="sm"
              />
            </template>
            <span v-else class="text-gray-500">
              {{ placeholder }}
            </span>
          </div>
        </slot>
      </template>
    </USelectMenu>
    <!-- 操作按钮 -->
    <div class="flex justify-between items-center">
      <UButton
        size="xs"
        color="gray"
        variant="ghost"
        @click="toggleSelectAll"
      >
        {{ selectAllState }}
      </UButton>
      <UButton
        v-if="model.length"
        size="xs"
        color="red"
        variant="ghost"
        icon="i-heroicons-x-mark"
        @click="clearSelection"
      >
        清除
      </UButton>
    </div>
  </div>
</template> 