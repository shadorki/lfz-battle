import { BattleComponent } from "."

export class BackDrop extends BattleComponent {
  private _isShowing: boolean
  private _backDropElement: HTMLElement
  constructor() {
    super()
    this._isShowing = false
    this._backDropElement = document.querySelector('.battle-arena-backdrop')
  }
  get isShowing(): boolean {
    return this._isShowing
  }
  set isShowing(bool: boolean) {
    this._isShowing = bool
    this._backDropElement.style.opacity = Number(this._isShowing).toString()
  }
  show() {
    this.isShowing = true
  }
  hide() {
    this.isShowing = false
  }
}
