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
  constructor(name: string, path: string, grid: Array<number>) {
    super()
    this.sprite = new Sprite(name, path, grid)
    this.domElement = null
    this.width = null
    this.height = null
    this._acceptedTasks = new Set(['movement'])
    this._position = {
      x: 0,
      y: 0
    }
    this.debug(0, 0)
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
    const movements = {
      up: () => this._position.y--,
      down: () => this._position.y++,
      left: () => this._position.x--,
      right: () => this._position.x++
    }
    movements[direction]()
    this.updatePosition()
  }
  updatePosition(): void {
    const { x, y } = this._position
    this.domElement.style.top = `${y * this.height}px`
    this.domElement.style.left = `${x * this.width}px`
    this.debug(x, y)
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
    return this.domElement
  }
}
