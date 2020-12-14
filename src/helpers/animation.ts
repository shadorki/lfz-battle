export class Animation {
  private _name: string
  private _sheet: number[][]
  private _speed: number
  private _intervalId: number
  private _animatedElement: HTMLElement
  constructor(name: string, sheet: number[][], speed: number, getAnimatedElement: HTMLElement) {
    this._name = name
    this._sheet = sheet
    this._speed = speed
    this._intervalId = null
    this._animatedElement = getAnimatedElement
  }
  play(): void {
    let spriteCounter = 0
    this._intervalId = window.setInterval(() => {
      if(spriteCounter === this._sheet.length - 1) return clearInterval(this._intervalId)
      const [x, y] = this._sheet[spriteCounter]
      this._animatedElement.style.backgroundPosition = `${x}px ${y}px`
    }, this._speed)
  }
}
