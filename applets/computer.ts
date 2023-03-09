import { defineAppletConfig } from './type'

export default defineAppletConfig({
  name: 'computer',
  title: '计算机',
  icon: 'computer',
  enableMinimize: false,
  enableMaximize: false,
  backgroundColor: '#EAEAEA',
  customTitleBar: true,
  showInDock: false,
  route: '/computer',
  windowWidth: '36vh',
  windowHeight: '64vh',
})
