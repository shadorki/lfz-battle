import { Sprite, Task } from '../helpers'
import { Observer } from './'
import { Movements, Position } from '../interfaces'

export class Camera extends Observer {
  private _acceptedTasks: Set<string>
  private _visibleWidth: number
  private _visibleHeight: number
  private _collisionWidth: number
  private _collisionHeight: number
  private _isDebugMode: boolean
  public domElement: HTMLElement
  constructor(width: number, height: number, isDebugMode: boolean = false) {
    super()
    this._acceptedTasks = new Set(['movement'])
    this._visibleWidth = width
    this._visibleHeight = height
    this._collisionWidth = width / 10 * 8
    this._collisionHeight = height / 10 * 6
    this._isDebugMode = isDebugMode
    this.domElement = null
  }
  handleUpdate(task: Task): void {

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
  init(): HTMLElement {
    this.domElement = this.createElement()
    return this.domElement
  }
}
