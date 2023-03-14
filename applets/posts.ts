import { defineAppletConfig } from './type'

export default defineAppletConfig({
  name: 'posts',
  title: 'Posts',
  icon: 'reader',
  route: '/posts',
  replaceDesktopDirectly: true,
})
