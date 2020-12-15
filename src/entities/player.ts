import { Animator, Sprite, Task } from '../helpers'
import { Observer } from './'
import { Movements, PlayerFacingPositions, Position } from '../interfaces'

export class Player extends Observer {
  public sprite: Sprite
  public animator: Animator
  public domElement: HTMLElement
  public width: number
  public height: number
  private _acceptedTasks: Set<string>
  private _position: Position
  private _playerFacingPositions: PlayerFacingPositions
  private _currentFacingPosition: keyof PlayerFacingPositions
  private _isSpaceWalkable: Function
  constructor(name: string, path: string, grid: number[], startingPosition: Position, isSpaceWalkable: Function) {
    super()
    this.sprite = new Sprite(name, path, grid)
    this.animator = null
    this.domElement = null
    this.width = null
    this.height = null
    this._acceptedTasks = new Set(['movement'])
    this._position = startingPosition
    this._playerFacingPositions = null
    this._currentFacingPosition = 'down'
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
    this.setFacingPosition(direction)
    this.animator.play(direction)
    if(this._isSpaceWalkable(x, y)) return
    movements[direction](this._position)
    this.updatePositionOnDOM(direction)
  }
  updatePositionOnDOM(direction: keyof Movements): void {
    let [ left, top ] = this.playerPositionOnDOM
    const movements: Movements = {
      up: () => top -= this.height,
      down: () => top += this.height,
      left: () => left -= this.width,
      right: () => left += this.width
    }
    movements[direction]()
    this.domElement.style.top = `${top}px`
    this.domElement.style.left = `${left}px`
  }
  setFacingPosition(direction: keyof PlayerFacingPositions): void {
    this._currentFacingPosition = direction
    const [x, y] = this._playerFacingPositions[direction]
    this.domElement.style.backgroundPosition = `${x}px ${y - 24}px`
  }
  get playerPositionOnDOM(): number[] {
    const { left, top } = this.domElement.style
    const newLeft = Number(left.substring(0, left.length - 2))
    const newTop = Number(top.substring(0, top.length - 2))
    return [newLeft, newTop]
  }
  setInitialPositionOnDom(): void {
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
    element.style.backgroundPosition = `${x}px ${y - 24}px`
    element.style.backgroundRepeat = 'no-repeat'
    element.style.width = `${width}px`
    element.style.height = `${height}px`
    element.style.position = 'absolute'
    element.style.transition = 'left 500ms, top 500ms'
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
  createAnimations(): void {
    const { sheet } = this.sprite
    this.animator = new Animator(this.domElement)
    this.animator.addAnimation(
      'down',
      [
        sheet[0],
        sheet[1],
        sheet[2],
      ],
      100,
    )
    this.animator.addAnimation(
      'up',
      [
        sheet[6],
        sheet[7],
        sheet[8],
      ],
      100,
    )
    this.animator.addAnimation(
      'left',
      [
        sheet[12],
        sheet[13],
        sheet[14],
      ],
      100,
    )
    this.animator.addAnimation(
      'right',
      [
        sheet[18],
        sheet[19],
        sheet[20],
      ],
      100,
    )
  }
  setFacingPositions() {
    const { sheet } = this.sprite
    this._playerFacingPositions = {
      'up': sheet[6],
      'down': sheet[0],
      'right': sheet[18],
      'left': sheet[12],
    }
  }
  async init(): Promise<HTMLElement> {
    await this.sprite.init()
    this.domElement = this.createElement()
    this.setFacingPositions()
    this.createAnimations()
    this.setInitialPositionOnDom()
    return this.domElement
  }
}
