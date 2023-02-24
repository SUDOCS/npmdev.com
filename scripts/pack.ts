import path, { resolve } from 'path'
import compressing from 'compressing'

path.join = path.posix.join

const input = resolve(__dirname, '../.output/')
const output = resolve(__dirname, '../output.tgz')

compressing.tgz.compressDir(input, output).then(() => {
  console.log('compressed successfully')
})
