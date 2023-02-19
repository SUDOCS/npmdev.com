import { defineAppletConfig } from './type'

import icon from '@/assets/icons/apps/preferences-system.svg?url'

export default defineAppletConfig({
  name: 'settings',
  title: '设置',
  icon,
  dockArea: 'right',
  showInDesktop: false,
})
