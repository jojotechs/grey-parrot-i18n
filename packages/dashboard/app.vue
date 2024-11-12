<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const title = computed(() => route.meta.title as string)
useHead({
  title,
  titleTemplate: () => {
    return title.value
      ? `${title.value} | Grey Parrot i18n`
      : 'Grey Parrot i18n'
  }
})
</script>

