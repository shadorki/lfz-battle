import { BattleComponent } from "."

export abstract class UI extends BattleComponent {
  private _classBase: string
  public _uiContainer: HTMLElement
  private _movingPosition: string
  private _isShowing: boolean
  constructor(isPlayer: boolean) {
    super()
    this._classBase = isPlayer ? 'player' : 'enemy'
    this._movingPosition = isPlayer ? 'right' : 'left'
    this._uiContainer = document.querySelector(`.${this._classBase}-ui`)
    this._isShowing = false
  }
  get isShowing(): boolean {
    return this._isShowing
  }
  set isShowing(bool: boolean) {
    this._isShowing = bool
    if(this._isShowing) {
      this._uiContainer.style[this._movingPosition] = '2px'
    } else {
      this._uiContainer.style[this._movingPosition] = '-360px'
    }
  }
  show() {
    this.isShowing = true
  }
  hide() {
    this.isShowing = false
  }
}
