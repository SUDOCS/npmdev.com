import { defineAppletConfig } from './type'
import icon from '@/assets/icons/apps/computer.svg?url'

export default defineAppletConfig({
  name: 'computer',
  title: '计算机',
  icon,
  enableMinimize: false,
  backgroundColor: '#EAEAEA',
  customTitleBar: true,
})
