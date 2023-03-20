import AliOss from 'ali-oss'
import { createRouter, defineEventHandler, useBase } from 'h3'

const config = useRuntimeConfig()

const client = new AliOss({
  // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: config.oss.region,
  // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
  accessKeyId: config.oss.accessKeyId,
  accessKeySecret: config.oss.accessKeySecret,
  // yourbucketname填写存储空间名称。
  bucket: config.oss.bucket,
})

const router = createRouter()

function convertPrefix(prefix: string) {
  let result = prefix
  if (!result.endsWith('/')) {
    result += '/'
  }

  if (result.startsWith('/')) {
    result = result.slice(1)
  }

  return result
}

async function listFiles(prefix: string) {
  console.log('listFiles', prefix)
  const result = await client.listV2({
    prefix: convertPrefix(prefix),
    delimiter: '/',
  })

  const { objects, prefixes } = result

  const dirs = prefixes?.map((prefix: string) => ({
    name: prefix.slice(0, -1),
    type: 'dir',
  })) ?? []

  const files = objects?.map((object: any) => ({
    name: object.name.split('/').pop(),
    type: 'file',
    url: client.signatureUrl(object.name),
    size: object.size,
    etag: object.etag,
    lastModified: object.lastModified,
  })) ?? []

  return dirs.concat(files)
}

router.get('/list', defineEventHandler(async () => {
  return await listFiles('')
}))

router.get('/list/**', defineEventHandler(async (event) => {
  const { _: path } = event.context.params as Record<string, any>

  return await listFiles(path)
}))

router.get('/*', defineEventHandler(async () => {
  console.log('hello')
  return 'hello'
}))

export default useBase('/api/oss', router.handler)
