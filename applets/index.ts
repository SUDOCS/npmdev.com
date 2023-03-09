import Album from './album'
import Blog from './blog'
import Computer from './computer'
import Explorer from './explorer'
import Github from './github'
import Launcher from './launcher'
import Music from './music'
import P2PFileTransfer from './p2p-file-transfer'
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
  P2PFileTransfer,
  Launcher,
  Settings,
  TrashBin,
]

export default AllApps

export const desktopApps = AllApps.filter(app => app.showInDesktop)

export const dockLeftApps = AllApps.filter(app => app.dockArea === 'left' && app.showInDock)

export const dockRightApps = AllApps.filter(app => app.dockArea === 'right' && app.showInDock)

export const dockCenterApps = AllApps.filter(app => app.dockArea === 'center' && app.showInDock)
