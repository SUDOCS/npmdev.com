/// <reference types="vite/client" />

declare module 'virtual:wallpaper-auto-scanner' {
    const wallpapers: string[]
    export default wallpapers
}

declare type BuildInfo = {
    name: string
    version: string
    author: string
    commitHash: string
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    buildDate: number
}

declare module 'virtual:build-info' {
    const buildInfo: BuildInfo
    export default buildInfo
}