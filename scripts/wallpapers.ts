import fs from 'fs'
import path from 'path'

const _wallpapers = fs.readdirSync(path.join(__dirname, '../public/wallpapers')).map(name => `/wallpapers/${name}`)

console.log(_wallpapers)
