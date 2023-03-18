import type { Component } from 'vue'

export interface AppletConfig {
  /* 标识 */
  name: string
  /* 名称 */
  title: string
  /* 图标 */
  icon: string
  /* 允许在新标签页打开 */
  enableOpenInNewTab?: boolean
  /* 允许最小化 */
  enableMinimize?: boolean
  /* 允许最大化 */
  enableMaximize?: boolean
  /* 窗口背景颜色 */

  defaultMaximized?: boolean

  backgroundColor?: string
  /* 自定义窗口标题栏，但是图标和按钮依旧会存在 */
  customTitleBar?: boolean

  hidden?: boolean

  /* 在 Dock 中的位置 */
  dockArea?: 'left' | 'right' | 'center'
  /* 是否在桌面展示图标 */
  showInDesktop?: boolean
  showInDock?: boolean

  /* 窗口默认宽度 */
  windowWidth?: string
  /* 窗口默认高度 */
  windowHeight?: string

  /* 应用打开的路由 */
  route?: string

  /* 替换桌面，打开这个Applet对应的页面 */
  replaceDesktopDirectly?: boolean

  /* 应用的桌面组件，统一为组件中包含窗口，窗口中打开frame */
  desktopComponent?: Component
}

export const defaultAppleatConfig: Partial<AppletConfig> = {
  enableOpenInNewTab: true,
  enableMinimize: true,
  enableMaximize: true,
  defaultMaximized: false,
  customTitleBar: false,
  dockArea: 'center',
  showInDesktop: true,
  showInDock: true,
  replaceDesktopDirectly: false,
  hidden: false,
}

// as inline 会在资源导入时加上?inline，然后通过vite插件将svg内联
const icons = import.meta.glob('@/assets/icons/apps/*.svg', { eager: true, as: 'inline' })

export function defineAppletConfig(config: AppletConfig) {
  const iconKey = `/assets/icons/apps/${config.icon}.svg`
  config.icon = (icons[iconKey] as unknown as { default: string }).default

  for (const key in defaultAppleatConfig) {
    if (config[key] === undefined) {
      config[key] = defaultAppleatConfig[key]
    }
  }
  return config
}
