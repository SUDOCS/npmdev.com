import { execa } from 'execa'
import fg from 'fast-glob'

const allImages: string[] = fg.sync(['public/wallpapers/*.jpg', 'public/wallpapers/*.png', 'public/wallpapers/*.jpeg'], { onlyFiles: true, absolute: true })

// console.log(allImages)

allImages.forEach(async (image) => {
  console.log(`Converting ${image} to webp`)
  await execa('cwebp', ['-q', '80', image, '-o', `${image.replace(/\.(jpg|png|jpeg)$/, '.webp')}`])
  // await execa('rimraf', [image])
})
