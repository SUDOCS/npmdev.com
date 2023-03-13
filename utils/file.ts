export class SliceFile {
  slices: ArrayBuffer[] = []

  // 总分片数量
  sliceCount = 0
  // 已填充的分片数量
  fillCount = 0

  fileName = ''
  // 文件总大小
  fileSize = 0
  // 分片大小
  sliceSize = 0

  static fromFile(file: File) {
    const sliceSize = 1024 * 16
    const sliceFile = new SliceFile(sliceSize, file.size, file.name)
    return file.arrayBuffer().then((buffer) => {
      for (let i = 0; i < sliceFile.sliceCount; i++) {
        const slice = buffer.slice(i * sliceSize, (i + 1) * sliceSize)
        sliceFile.push(i, slice)
      }
      return sliceFile
    })
  }

  constructor(sliceSize: number, fileSize: number, fileName: string) {
    this.fileSize = fileSize
    this.sliceSize = sliceSize
    this.sliceCount = Math.ceil(fileSize / sliceSize)
    this.fillCount = 0
    this.slices = new Array(this.sliceCount)
    this.fileName = fileName
  }

  push(index: number, slice: ArrayBuffer) {
    this.slices[index] = slice
    this.fillCount++
  }

  get name() {
    return this.fileName
  }

  get percentage() {
    return this.fillCount / this.sliceCount * 100
  }

  get complete() {
    return this.fillCount === this.sliceCount
  }

  get Blob() {
    return new Blob(this.slices.flat(), { type: 'application/octet-stream' })
  }

  at(index: number) {
    return this.slices[index]
  }
}
