import fs from 'fs'
import path, { resolve } from 'path'
import compressing from 'compressing'

path.join = path.posix.join

const tgzStream = new compressing.tgz.Stream()

tgzStream.addEntry(resolve(__dirname, '../.output/'))
tgzStream.addEntry(resolve(__dirname, '../ecosystem.config.js'))

fs.mkdirSync(resolve(__dirname, '../.deploy'), { recursive: true })

const destStream = fs.createWriteStream(resolve(__dirname, '../.deploy/output.tgz'))

tgzStream.pipe(destStream)
  .on('finish', () => {
    console.log('compress finished')
  })
  .on('error', (err) => {
    console.error('compress failed', err)
  })
