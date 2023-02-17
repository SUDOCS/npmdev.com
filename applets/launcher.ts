import { defineAppletConfig } from './type'
import icon from '@/assets/icons/apps/launcher.svg?url'

export default defineAppletConfig({
  name: 'launcher',
  title: '启动器',
  icon,
  dockArea: 'left',
  showInDesktop: false,
})
