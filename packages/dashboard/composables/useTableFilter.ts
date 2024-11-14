export function useTableFilter<T>(items: Ref<T[] | null>, pageSize = 10) {
  const searchQuery = ref('')
  const currentPage = ref(1)

  const filteredItems = computed(() => {
    let result = items.value || []

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(item =>
        Object.values(item as object).some(
          val => String(val).toLowerCase().includes(query),
        ),
      )
    }

    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize

    return result.slice(start, end)
  })

  return {
    searchQuery,
    currentPage,
    filteredItems,
  }
}
