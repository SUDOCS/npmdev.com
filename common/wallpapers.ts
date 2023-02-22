const _wallpapers = import.meta.glob('@/assets/wallpapers/*.{jpg,png}', { as: 'url', eager: true })

export default Object.values(_wallpapers)
