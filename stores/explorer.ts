export const useExplorerStore = defineStore('explorer', () => {
  const listStyle = ref<'block' | 'detail'>('block')

  function toggleStyle() {
    listStyle.value = listStyle.value === 'block' ? 'detail' : 'block'
  }

  return {
    listStyle,
    toggleStyle,
  }
})
