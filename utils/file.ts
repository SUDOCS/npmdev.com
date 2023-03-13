export class SliceFile {
  slices: ArrayBuffer[] = []
  sliceCount = 0

  fileName = ''

  constructor(sliceSize: number, fileSize: number, fileName: string) {
    this.sliceCount = Math.ceil(fileSize / sliceSize)
    this.slices = new Array(this.sliceCount)
    this.fileName = fileName
  }

  push(index: number, slice: ArrayBuffer) {
    this.slices[index] = slice
  }

  get name() {
    return this.fileName
  }

  get percentage() {
    return this.slices.filter(slice => slice !== undefined).length / this.sliceCount
  }

  get complete() {
    return this.slices.every(slice => slice !== undefined)
  }

  get Blob() {
    return new Blob(this.slices.flat(), { type: 'application/octet-stream' })
  }
}
