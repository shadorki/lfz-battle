import { Animator, Sprite, Task, TaskQueue } from '../helpers'
import { Observer } from './'
import { Movements, PlayerFacingPositions, Position } from '../interfaces'

export class Player extends Observer {
  public sprite: Sprite
  public animator: Animator
  public domElement: HTMLElement
  public width: number
  public height: number
  public getSceneTransition: Function
  public isSpaceWalkable: Function
  public isSceneTransition: Function
  private _taskQueue: TaskQueue
  private _acceptedTasks: Set<string>
  private _position: Position
  private _playerFacingPositions: PlayerFacingPositions
  private _currentFacingPosition: keyof PlayerFacingPositions
  constructor(
    name: string,
    path: string,
    grid: number[],
    taskQueue: TaskQueue,
    getSceneTransition: Function,
    isSpaceWalkable: Function,
    isSceneTransition: Function
  ) {
    super()
    this.sprite = new Sprite(name, path, grid)
    this.animator = null
    this.domElement = null
    this.width = null
    this.height = null
    this._taskQueue = taskQueue
    this._acceptedTasks = new Set(['movement', 'scene-transition-start'])
    this._position = null
    this._playerFacingPositions = null
    this._currentFacingPosition = 'down'
    this.getSceneTransition = getSceneTransition
    this.isSpaceWalkable = isSpaceWalkable
    this.isSceneTransition = isSceneTransition
  }
  handleUpdate({name, action}: Task): void {
    if(!this._acceptedTasks.has(name)) return
    switch(name) {
      case 'movement':
        this.handleMovement(action as keyof Movements)
      break
      case 'scene-transition-start':
        this.handleSceneTransitionStart(action)
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
    if(!this.isSpaceWalkable(x, y)) return
    this.animator.play(direction)
    movements[direction](this._position)
    this.updatePositionOnDOM(direction)
    if(this.isSceneTransition(x, y)) {
      this._taskQueue.addTask(
        new Task(
          'scene-transition-start',
          this.getSceneTransition(x, y)
        )
      )
    }
  }
  handleSceneTransitionStart(action: any) {
    const {
      playerPositionOnDOM,
      playerPosition,
      playerFacingPosition,
    } = action
    const [x, y] = playerPositionOnDOM
    this.setFacingPosition(playerFacingPosition)
    this._position = playerPosition
    this.setPlayerPositionOnDom(x, y)
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
    this.setPlayerPositionOnDom(top, left)
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
  setPlayerPositionOnDom(x: number, y:number): void {
    this.domElement.style.top = `${x}px`
    this.domElement.style.left = `${y}px`
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
        sheet[1],
        sheet[2],
        sheet[0],
      ],
      100,
    )
    this.animator.addAnimation(
      'up',
      [
        sheet[7],
        sheet[8],
        sheet[6],
      ],
      100,
    )
    this.animator.addAnimation(
      'left',
      [
        sheet[13],
        sheet[14],
        sheet[12],
      ],
      100,
    )
    this.animator.addAnimation(
      'right',
      [
        sheet[19],
        sheet[20],
        sheet[18],
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
  async init(startingPosition: Position): Promise<HTMLElement> {
    this._position = startingPosition
    await this.sprite.init()
    this.domElement = this.createElement()
    this.setFacingPositions()
    this.createAnimations()
    this.setInitialPositionOnDom()
    return this.domElement
  }
}
