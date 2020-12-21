import { BattleComponent } from "."
export class HP extends BattleComponent{
  private _health: number
  private _damage: number
  private _classBase: string
  private _healthBarContainer: HTMLElement
  private _movingPosition: string
  private _isShowing: boolean
  private _healthBar: HTMLElement
  constructor(
    isPlayer: boolean
  ) {
    super()
    this._health = 100
    this._damage = null
    this._classBase = isPlayer ? 'player' : 'enemy'
    this._movingPosition = isPlayer ? 'left' : 'right'
    this._healthBarContainer = document.querySelector(`.${this._classBase}-health-bar-container`)
    this._healthBar = <HTMLElement>this._healthBarContainer.firstElementChild
    this._isShowing = false
  }
  setDamageCounter(damage: number) {
    this._damage = damage
  }
  damage(): void {
    if(this._health - this._damage < 0) {
      this._health = 0
      this._healthBar.style.height = this._health + '%'
    } else {
      this._health -= this._damage
      this._healthBar.style.height = this._health + '%'
    }
  }
  get isDead(): boolean {
    return !this._health
  }
  get isShowing(): boolean {
    return this._isShowing
  }
  set isShowing(bool: boolean) {
    this._isShowing = bool
    if (this._isShowing) {
      this._healthBarContainer.style[this._movingPosition] = '2px'
    } else {
      this._healthBarContainer.style[this._movingPosition] = '-26px'
    }
  }
  show() {
    this.isShowing = true
  }
  hide() {
    this.isShowing = false
  }
  reset(): void {
    this._health = 100
    this._healthBar.style.height = this._health + '%'
  }
}
