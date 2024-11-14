<script setup lang="ts">
import MultiSelect from '~/components/common/MultiSelect.vue'

const model = defineModel<string[]>()
const { languageOptions } = useSheets()
</script>

<template>
  <MultiSelect
    v-model="model"
    :options="languageOptions"
    placeholder="请选择语言"
  />
</template> 