import Album from './album'
import Computer from './computer'
import Explorer from './explorer'
import P2PFileTransfer from './file-transfer'
import Github from './github'
import Launcher from './launcher'
import Live from './live'
import Music from './music'
import Posts from './posts'
import Reader from './reader'
import Resume from './resume'
import Settings from './settings'
import TrashBin from './trash-bin'

const AllApps = [
  Computer,
  Explorer,
  Github,
  Posts,
  Music,
  Album,
  Resume,
  Reader,
  P2PFileTransfer,
  Live,
  Launcher,
  Settings,
  TrashBin,
]

export default AllApps

export const desktopApps = AllApps.filter(app => app.showInDesktop)

export const dockLeftApps = AllApps.filter(app => app.dockArea === 'left' && app.showInDock)

export const dockRightApps = AllApps.filter(app => app.dockArea === 'right' && app.showInDock)

export const dockCenterApps = AllApps.filter(app => app.dockArea === 'center' && app.showInDock)
