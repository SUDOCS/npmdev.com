import { defineAppletConfig } from './type'
import icon from '@/assets/icons/apps/trash-bin.svg?url'

export default defineAppletConfig({
  name: 'trash-bin',
  title: '垃圾桶',
  icon,
  dockArea: 'right',
  showInDesktop: false,
})
