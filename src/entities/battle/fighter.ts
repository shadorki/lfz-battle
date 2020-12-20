import { BattleComponent } from "."

export abstract class Fighter extends BattleComponent {
  private _classBase: string
  private _movingPosition: string[]
  private _isShowing: boolean
  public _characterContainer: HTMLElement
  constructor(
    isPlayer: boolean
  ) {
    super()
    this._classBase = isPlayer ? 'player' : 'enemy'
    this._characterContainer = document.querySelector(`.${this._classBase}`)
    this._isShowing = false
    this._movingPosition = isPlayer ? ['left', '64px'] : ['right', '96px']
  }
  async damage(): Promise<void> {
    let blinks: number = 6
    let intervalId: number = null
    return new Promise(resolve => {
      intervalId = window.setInterval(() => {
        if(!blinks) {
          clearInterval(intervalId)
          return resolve()
        }
        this._characterContainer.style.opacity = (blinks % 2).toString()
        blinks--
      }, 100)
    })
  }
  get isShowing(): boolean {
    return this._isShowing
  }
  set isShowing(bool: boolean) {
    this._isShowing = bool
    const [position, value] = this._movingPosition
    if (this._isShowing) {
      this._characterContainer.style[position] = value
    } else {
      this._characterContainer.style[position] = '-128px'
    }
  }
  show() {
    this.isShowing = true
  }
  hide() {
    this.isShowing = false
  }
}
