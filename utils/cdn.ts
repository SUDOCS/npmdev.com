const CDN_PREFIX = '//res.npmdev.com'

export function assetsWithCDN(url: string) {
  if (/^\/_nuxt\/assets/.test(url)) {
    return url.replace(/^\/_nuxt\/assets/, CDN_PREFIX)
  }
}
