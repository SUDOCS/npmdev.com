import mp3Svg from '@/assets/icons/mimetypes/application-m3u.svg?inline'
import rarSvg from '@/assets/icons/mimetypes/application-vnd.rar.svg?inline'
import msExeSvg from '@/assets/icons/mimetypes/application-x-ms-dos-executable.svg?inline'
import zipSvg from '@/assets/icons/mimetypes/application-zip.svg?inline'
import imageSvg from '@/assets/icons/mimetypes/image.svg?inline'
import txtSvg from '@/assets/icons/mimetypes/text-plain.svg?inline'
import unknownSvg from '@/assets/icons/mimetypes/unknown.svg?inline'
import videoSvg from '@/assets/icons/mimetypes/video.svg?inline'
import folderSvg from '@/assets/icons/places/folder.svg?inline'

export function getIconWithFile(file: Record<string, any>) {
  if (file.type === 'dir') {
    return folderSvg
  }

  const ext = file.name.split('.').pop()
  switch (ext) {
    case 'mp3':
      return mp3Svg
    case 'mp4':
    case 'avi':
    case 'rmvb':
    case 'rm':
    case 'flv':
    case 'mkv':
    case 'mov':
    case 'wmv':
    case 'mpg':
    case 'mpeg':
    case '3gp':
    case 'webm': {
      return videoSvg
    }

    case 'jpg':
    case 'png':
    case 'gif':
    case 'webp':
      return imageSvg
    case 'svg':
    case 'rar':
      return rarSvg
    case 'zip':
      return zipSvg
    case 'exe':
      return msExeSvg
    case 'txt':
      return txtSvg
    default:
      return unknownSvg
  }
}
