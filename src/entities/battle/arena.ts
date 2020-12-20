import { Sprite } from "../../helpers"
import { BattleComponent } from "."

export class Arena extends BattleComponent {
  private _isShowing: boolean
  private _arenaElement: HTMLElement
  private _sprite: Sprite
  private _selectedBackgroundPosition: number[]
  private _arenaBackgrounds: {
    [key: string]: number[]
  }
  constructor() {
    super()
    this._isShowing = false
    this._arenaElement = document.querySelector('.battle-arena-container')
    this._selectedBackgroundPosition = null
    this._sprite = new Sprite(
      'background',
      './assets/images/maps/battle-backgrounds.png',
      [3, 4]
    )
    this._arenaBackgrounds = null
    this._sprite.init()
    .then(() => {
      const { sheet } = this._sprite
      const [
        normal,
        rock,
        dirt,
        ghost,
        grass,
        water,
        psychic,
        ,
        ocean,
        ice,
        plant
      ] = sheet
      this._arenaBackgrounds = {
        normal,
        rock,
        dirt,
        ghost,
        grass,
        water,
        psychic,
        ocean,
        ice,
        plant
      }
    })
  }
  set(arena: string): void {
    this._selectedBackgroundPosition = this._arenaBackgrounds[arena]
    const [x, y] = this._selectedBackgroundPosition
    this._arenaElement.style.backgroundPosition = `${x}px ${y}px`
  }
  get isShowing(): boolean {
    return this._isShowing
  }
  set isShowing(bool: boolean) {
    this._isShowing = bool
    this._arenaElement.style.opacity = Number(this._isShowing).toString()
  }
  show() {
    this.isShowing = true
  }
  hide() {
    this.isShowing = false
  }
}
