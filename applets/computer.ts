import { defineAppletConfig } from './type'

export default defineAppletConfig({
  name: 'computer',
  title: '计算机',
  icon: 'computer',
  enableMinimize: false,
  backgroundColor: '#EAEAEA',
  customTitleBar: true,
  route: '/computer',
})
