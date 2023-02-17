import { defineAppletConfig } from './type'
import icon from '@/assets/icons/apps/music.svg?url'

export default defineAppletConfig({
  name: 'music',
  title: '音乐盒',
  icon,
  backgroundColor: '#EAEAEA',
  customTitleBar: true,
})
