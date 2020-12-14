import { Sprite, Task } from '../helpers'
import { Observer } from './'
import { Movements, Position } from '../interfaces'
import { Player } from './player'

export class Camera extends Observer {
  private _acceptedTasks: Set<string>
  private _visibleWidth: number
  private _visibleHeight: number
  private _collisionWidth: number
  private _collisionHeight: number
  private _isDebugMode: boolean
  private _player: Player
  private _backgroundElement: HTMLElement
  private _cameraPosition: Array<number>
  public domElement: HTMLElement
  constructor(width: number, height: number, backgroundElement: HTMLElement, isDebugMode: boolean = false) {
    super()
    this._acceptedTasks = new Set(['movement'])
    this._visibleWidth = width
    this._visibleHeight = height
    this._collisionWidth = width / 10 * 8
    this._collisionHeight = height / 10 * 6
    this._isDebugMode = isDebugMode
    this._player = null
    this._backgroundElement = backgroundElement
    this._cameraPosition = [0, 0]
    this.domElement = null
  }
  handleUpdate({ name }: Task): void {
    if (!this._acceptedTasks.has(name)) return
    switch (name) {
      case 'movement':
        this.handleMovement()
        break
    }
  }
  handleMovement(): void {
    const [ left, top ] = this._player.playerPositionOnDOM
    const [ maxLeft, maxRight, maxTop, maxBottom] = this.playerBoundaries
    let selectedMovement: keyof Movements = null
    if(left > maxLeft) {
      selectedMovement = 'left'
    } else if(left < maxRight) {
      selectedMovement = 'right'
    } else if (top > maxTop) {
      selectedMovement = 'up'
    } else if( top < maxBottom) {
      selectedMovement = 'down'
    }
    if(!selectedMovement) return
    this._player.updatePositionOnDOM(selectedMovement)
    this.moveCamera(selectedMovement)
  }
  moveCamera(direction: keyof Movements): void {
    const { width, height } = this._player
    let [ x, y ] = this._cameraPosition
    const movements: Movements = {
      up: () => y -= height,
      down: () => y += height,
      left: () => x -= width,
      right: () => x += width
    }
    movements[direction]()
    this._cameraPosition = [ x, y ]
    this.updatePositionOnDOM()
  }
  updatePositionOnDOM(): void {
    const [x, y] = this._cameraPosition
    this._backgroundElement.style.backgroundPosition = `${x}px ${y}px`
  }
  get playerBoundaries(): Array<number> {
    return [
      this._collisionWidth,
      this._visibleWidth - this._collisionWidth,
      this._collisionHeight,
      Math.abs(this._visibleHeight - this._collisionHeight * 2)
    ]
  }
  createElement(): HTMLElement {
    const element = document.createElement('div')
    element.style.width = `${this._collisionWidth}px`
    element.style.height = `${this._collisionHeight}px`
    element.style.position = 'absolute'
    if(this._isDebugMode) {
      element.style.border = '2px solid red'
      element.style.boxSizing = 'border-box'
    }
    return element
  }
  init(player: Player): HTMLElement {
    this._player = player
    this.domElement = this.createElement()
    return this.domElement
  }
}
