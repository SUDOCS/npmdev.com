const Preference = {
  get: (key: string) => {
    const obj = localStorage.getItem(key)
    if (obj) {
      const { val, expire } = JSON.parse(obj)
      if (expire === -1 || new Date().valueOf() <= expire) {
        return val
      }
    }
    return undefined
  },
  // expire === -1 时永不过期
  set: (key: string, val: unknown, expire = 3600) => {
    const obj = {
      val,
      expire: expire === -1 ? -1 : new Date().valueOf() + expire * 1000,
    }
    localStorage.setItem(key, JSON.stringify(obj))
  },
  remove: (key: string) => {
    localStorage.removeItem(key)
  },
}

export default Preference
