import { Sprite, Task } from '../helpers'
import { Observer } from './'
import { Movements, Position } from '../interfaces'

export class Player extends Observer {
  public sprite: Sprite
  public domElement: HTMLElement
  public width: number
  public height: number
  private _acceptedTasks: Set<string>
  private _position: Position
  private _isSpaceWalkable: Function
  constructor(name: string, path: string, grid: Array<number>, startingPosition: Position, isSpaceWalkable: Function) {
    super()
    this.sprite = new Sprite(name, path, grid)
    this.domElement = null
    this.width = null
    this.height = null
    this._acceptedTasks = new Set(['movement'])
    this._position = startingPosition
    this._isSpaceWalkable = isSpaceWalkable
  }
  handleUpdate({name, action}: Task): void {
    if(!this._acceptedTasks.has(name)) return
    switch(name) {
      case 'movement':
        this.handleMovement(action as keyof Movements)
      break
    }
  }
  handleMovement(direction: keyof Movements): void {
    const position: Position = { ...this._position }
    const movements: Movements = {
      up: p => p.y--,
      down: p => p.y++,
      left: p => p.x--,
      right: p => p.x++
    }
    movements[direction](position)
    const { x, y } = position
    if(!this._isSpaceWalkable(x, y))
    movements[direction](this._position)
    this.updatePosition()
  }
  updatePosition(): void {
    const { x, y } = this._position
    this.domElement.style.top = `${y * this.height}px`
    this.domElement.style.left = `${x * this.width}px`
  }
  createElement(): HTMLElement {
    const element = document.createElement('div')
    const { path, sheet, width, height } = this.sprite
    const [[x, y]] = sheet
    this.width = width
    this.height = height
    element.style.backgroundImage = `url('${path}')`
    element.style.backgroundPosition = `${x}px ${y}px`
    element.style.backgroundRepeat = 'no-repeat'
    element.style.width = `${width}px`
    element.style.height = `${height}px`
    element.style.position = 'absolute'
    return element
  }
  debug(x: number, y: number): void{
    const element = document.createElement('div')
    element.className = 'space'
    element.dataset.x = x.toString()
    element.dataset.y = y.toString()
    element.style.top = `${y * this.height}px`
    element.style.left = `${x * this.width}px`
    document.getElementById('root').append(element)
  }
  async init(): Promise<HTMLElement> {
    await this.sprite.init()
    this.domElement = this.createElement()
    this.updatePosition()
    return this.domElement
  }
}
