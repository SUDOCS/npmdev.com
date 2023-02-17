import Blog from './blog'
import Computer from './computer'
import Github from './github'
import Launcher from './launcher'
import Music from './music'
import TrashBin from './trash-bin'

const AllApps = [
  Computer,
  Github,
  Blog,
  Music,
  Launcher,
  TrashBin,
]

export default AllApps

export const desktopApps = AllApps.filter(app => app.showInDesktop)

export const dockLeftApps = AllApps.filter(app => app.dockArea === 'left')

export const dockRightApps = AllApps.filter(app => app.dockArea === 'right')

export const dockCenterApps = AllApps.filter(app => app.dockArea === 'center')
