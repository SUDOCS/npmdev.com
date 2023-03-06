import fs from 'fs'
import path, { resolve } from 'path'
import compressing from 'compressing'

path.join = path.posix.join

const tgzStream = new compressing.tgz.Stream()

tgzStream.addEntry(resolve(__dirname, '../.output/'))
tgzStream.addEntry(resolve(__dirname, '../ecosystem.config.js'))

fs.mkdirSync(resolve(__dirname, '../.deploy'), { recursive: true })

const target = resolve(__dirname, '../.deploy/output.tgz')
const destStream = fs.createWriteStream(target)

tgzStream.pipe(destStream)
  .on('finish', () => {
    console.log('save to', resolve(__dirname, '../.deploy/output.tgz'), 'size', fs.statSync(target).size / 1024 / 1024, 'MB')
    console.log('compress finished')
  })
  .on('error', (err) => {
    console.error('compress failed', err)
  })
