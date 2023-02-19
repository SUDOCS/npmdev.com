import Album from './album'
import Blog from './blog'
import Computer from './computer'
import Explorer from './explorer'
import Github from './github'
import Launcher from './launcher'
import Music from './music'
import Resume from './resume'
import Settings from './settings'
import TrashBin from './trash-bin'

const AllApps = [
  Computer,
  Explorer,
  Github,
  Blog,
  Music,
  Album,
  Resume,
  Launcher,
  Settings,
  TrashBin,
]

export default AllApps

export const desktopApps = AllApps.filter(app => app.showInDesktop)

export const dockLeftApps = AllApps.filter(app => app.dockArea === 'left')

export const dockRightApps = AllApps.filter(app => app.dockArea === 'right')

export const dockCenterApps = AllApps.filter(app => app.dockArea === 'center')
