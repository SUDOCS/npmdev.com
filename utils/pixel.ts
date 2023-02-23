export function toPixelVal(value: string) {
  const unit = value.slice(-2)
  switch (unit) {
    case 'px':
      return Number(value.slice(0, -2))
    case 'vh':
      return window.innerHeight * Number(value.slice(0, -2)) / 100
    case 'vw':
      return window.innerWidth * Number(value.slice(0, -2)) / 100
  }

  return parseInt(value)
}
