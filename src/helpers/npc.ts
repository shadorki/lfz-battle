import { PlayerFacingPositions } from "../interfaces";
import { Sprite } from ".";
import { Position } from '../interfaces'

export class NPC {
  public name: string
  public sprite: Sprite
  public domElement: HTMLElement
  public width: number
  public height: number
  private _position: Position
  private _npcFacingPositions: PlayerFacingPositions
  private _currentFacingPosition: keyof PlayerFacingPositions
  constructor(
    name: string,
    path: string,
  ) {
    this.sprite = new Sprite(name, path, [4, 1])
    this.domElement = null
    this.width = null
    this.height = null
  }
  setFacingPositions() {
    const { sheet } = this.sprite
    this._npcFacingPositions = {
      'up': sheet[1],
      'down': sheet[0],
      'right': sheet[3],
      'left': sheet[2],
    }
  }
  createElement(): HTMLElement {
    const element = document.createElement('div')
    const { path, sheet, width, height } = this.sprite
    const [[x, y]] = sheet
    this.width = width
    this.height = height
    element.style.backgroundImage = `url('${path}')`
    element.style.backgroundPosition = `${x}px ${y - 24}px`
    element.style.backgroundRepeat = 'no-repeat'
    element.style.width = `${width}px`
    element.style.height = `${height}px`
    element.style.position = 'absolute'
    return element
  }
  setInitialPositionOnDom(): void {
    const { x, y } = this._position
    this.domElement.style.top = `${y * this.height}px`
    this.domElement.style.left = `${x * this.width}px`
  }
  async init(startingPosition: Position): Promise<HTMLElement> {
    this._position = startingPosition
    await this.sprite.init()
    this.domElement = this.createElement()
    this.setFacingPositions()
    this.setInitialPositionOnDom()
    return this.domElement
  }
}
