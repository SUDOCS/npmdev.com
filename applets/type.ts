import type { Component } from 'vue'

export interface AppletConfig {
  /* 标识 */
  name: string
  /* 名称 */
  title: string
  /* 图标 */
  icon: string
  /* 允许最小化 */
  enableMinimize?: boolean
  /* 允许最大化 */
  enableMaximize?: boolean
  /* 窗口背景颜色 */
  backgroundColor?: string
  /* 自定义窗口标题栏，但是图标和按钮依旧会存在 */
  customTitleBar?: boolean

  /* 在 Dock 中的位置 */
  dockArea?: 'left' | 'right' | 'center'
  /* 是否在桌面展示图标 */
  showInDesktop?: boolean

  /* 窗口默认宽度 */
  windowWidth?: string
  /* 窗口默认高度 */
  windowHeight?: string

  /* 应用打开的路由 */
  route?: string
  /* 应用的桌面组件，统一为组件中包含窗口，窗口中打开frame */
  desktopComponent?: Component
}

export const defaultAppleatConfig: Partial<AppletConfig> = {
  enableMinimize: true,
  enableMaximize: true,
  customTitleBar: false,
  dockArea: 'center',
  showInDesktop: true,
}

export function defineAppletConfig(config: AppletConfig) {
  for (const key in defaultAppleatConfig) {
    if (config[key] === undefined) {
      config[key] = defaultAppleatConfig[key]
    }
  }
  return config
}
