import { Movements, PlayerFacingPositions, Position} from "../interfaces";
import { Sprite } from ".";

export class NPC {
  public name: string
  public sprite: Sprite
  public domElement: HTMLElement
  public width: number
  public height: number
  private hasBattled: boolean
  private _position: Position
  private _npcFacingPositions: PlayerFacingPositions
  private _currentFacingPosition: keyof PlayerFacingPositions
  constructor(
    name: string,
    path: string,
    currentFacingPosition: keyof PlayerFacingPositions
  ) {
    this.name = name
    this.sprite = new Sprite(name, path, [4, 1])
    this._currentFacingPosition = currentFacingPosition
    this.domElement = null
    this.width = null
    this.height = null
    this.hasBattled = false
  }
  handleMovement(direction: keyof Movements): void {
    let [left, top] = this.npcPositionOnDOM
    const movements: Movements = {
      up: () => top -= this.height,
      down: () => top += this.height,
      left: () => left -= this.width,
      right: () => left += this.width
    }
    movements[direction]()
    this.setNPCPositionOnDom(left, top)
  }
  ejectFromDom(): void {
    this.domElement.remove()
  }
  faceTowardsPlayer(direction: keyof Movements) {
    const oppositeDirections: object = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    }
    this._currentFacingPosition = oppositeDirections[direction]
    this.setFacingPosition()
  }
  get npcPositionOnDOM(): number[] {
    const { left, top } = this.domElement.style
    const newLeft = Number(left.substring(0, left.length - 2))
    const newTop = Number(top.substring(0, top.length - 2))
    return [newLeft, newTop]
  }
  setNPCPositionOnDom(x: number, y: number): void {
    this.domElement.style.left = `${x}px`
    this.domElement.style.top = `${y}px`
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
  setFacingPosition(): void {
    const [x, y] = this._npcFacingPositions[this._currentFacingPosition]
    this.domElement.style.backgroundPosition = `${x}px ${y - 24}px`
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
    element.style.transition = 'left 500ms, top 500ms'
    return element
  }
  setInitialPositionOnDom(x: number, y:number): void {
    this.domElement.style.top = `${y}px`
    this.domElement.style.left = `${x}px`
  }
  async init(startingPosition: Position, positionOnDOM: number[]): Promise<HTMLElement> {
    this._position = startingPosition
    const [x, y] = positionOnDOM
    await this.sprite.init()
    this.domElement = this.createElement()
    this.setFacingPositions()
    this.setFacingPosition()
    this.setInitialPositionOnDom(x, y)
    return this.domElement
  }
}
