export enum MusicFileOrigin {
  Network,
  Local,
}
export interface MusicFile {
  origin: MusicFileOrigin

  get name(): string

  get url(): string
}

export class NetworkMusicFile implements MusicFile {
  origin = MusicFileOrigin.Network
  url: string
  name: string

  constructor(name: string, url: string) {
    this.name = name
    this.url = url
  }
}

export class LocalMusicFile implements MusicFile {
  origin = MusicFileOrigin.Local
  file: File

  constructor(file: File) {
    this.file = file
  }

  get url(): string {
    return URL.createObjectURL(this.file)
  }

  get name() {
    return this.file.name
  }
}
