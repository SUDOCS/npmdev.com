import AllApplets from '@/applets'

export const useAppletStore = defineStore('applet', () => {
  const activeApp = ref<string>('')
  const appIndex = ref(10000)
  const mountedApps = ref<string[]>([])

  function mountApp(appName: string) {
    const app = AllApplets.find(app => app.name === appName)

    if (!app)
      throw new Error(`Applet ${appName} not found`)

    if (app.replaceDesktopDirectly && app.route) {
      window.location.href = app.route
      return
    }

    if (mountedApps.value.includes(appName)) {
      activeApp.value = appName
      return
    }

    mountedApps.value.push(appName)
    activeApp.value = appName
  }

  function unmountApp(appName: string) {
    mountedApps.value = mountedApps.value.filter(name => name !== appName)
    activeApp.value = ''
  }

  function clearActiveApp() {
    activeApp.value = ''
  }

  function refreshAppIndex(): number {
    appIndex.value += 1
    return appIndex.value
  }

  return {
    activeApp,
    appIndex,
    mountedApps,
    mountApp,
    unmountApp,
    clearActiveApp,
    refreshAppIndex,
  }
})
