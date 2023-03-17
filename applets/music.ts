import { defineAppletConfig } from './type'

export default defineAppletConfig({
  name: 'music',
  title: '音乐盒',
  icon: 'music',
  backgroundColor: '#EAEAEA',
  enableMaximize: false,
  enableOpenInNewTab: false,
  windowWidth: '36vh',
  windowHeight: '64vh',
  route: '/music',
})
