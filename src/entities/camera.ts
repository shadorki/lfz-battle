import { Sprite, Task, TaskQueue } from '../helpers'
import { Observer } from './'
import { Levels, Movements, Position, StoredBackgroundPositions } from '../interfaces'
import { Player } from './player'

export class Camera extends Observer {
  private _acceptedTasks: Set<string>
  private _visibleWidth: number
  private _visibleHeight: number
  private _collisionWidth: number
  private _collisionHeight: number
  private _playerBoundaries: number[]
  private _isDebugMode: boolean
  private _player: Player
  private _backgroundElement: HTMLElement
  private _cameraPosition: number[]
  private _taskQueue: TaskQueue
  private _currentLevel: keyof Levels
  private _storedBackgroundPositions: StoredBackgroundPositions
  public domElement: HTMLElement
  constructor(
    taskQueue: TaskQueue,
    width: number,
    height: number,
    backgroundElement: HTMLElement,
    currentLevel: keyof Levels,
    isDebugMode: boolean = false
  ) {
    super()
    this._taskQueue = taskQueue
    this._storedBackgroundPositions = {}
    this._currentLevel = currentLevel
    this._acceptedTasks = new Set(['movement', 'scene-transition-start'])
    this._visibleWidth = width
    this._visibleHeight = height
    this._collisionWidth = width / 10 * 8
    this._collisionHeight = height / 10 * 6
    this._playerBoundaries = [512, 96, 256, 128]
    this._isDebugMode = isDebugMode
    this._player = null
    this._backgroundElement = backgroundElement
    this._cameraPosition = [0, 0]
    this.domElement = null
  }
  handleUpdate({ name, action }: Task): void {
    if (!this._acceptedTasks.has(name)) return
    switch (name) {
      case 'movement':
        this.handleMovement()
      break
      case 'scene-transition-start':
        this.handleSceneTransitionStart(action)
      break
    }
  }
  resetGym(): void {
    [
      'gymEntrance',
      'gymArena1PreBattle',
      'gymArena2PreBattle',
      'gymArena3PreBattle',
      'gymArena4PreBattle',
      'gymArena5PreBattle',
      'gymArena1PostBattle',
      'gymArena2PostBattle',
      'gymArena3PostBattle',
      'gymArena4PostBattle',
      'gymArena5PostBattle',
      'gymArena6',
    ].forEach(l => delete this._storedBackgroundPositions[l])
  }
  handleMovement(): void {
    const [ left, top ] = this._player.playerPositionOnDOM
    const [ maxLeft, maxRight, maxTop, maxBottom] = this._playerBoundaries
    let selectedMovement: keyof Movements = null
    if(left > maxLeft) {
      selectedMovement = 'left'
    } else if(left < maxRight) {
      selectedMovement = 'right'
    } else if (top >= maxTop) {
      selectedMovement = 'up'
    } else if( top < maxBottom) {
      selectedMovement = 'down'
    }
    if(!selectedMovement) return
    this._player.updatePositionOnDOM(selectedMovement)
    this.moveCamera(selectedMovement)
    this._taskQueue.addTask(new Task('npc-movement', selectedMovement))
  }
  handleSceneTransitionStart(action: any) {
    this._storedBackgroundPositions[this._currentLevel] = this.currentBackgroundPosition
    console.log(this._storedBackgroundPositions[this._currentLevel])
    const {
      backgroundPositionOnDOM,
      level
    } = action
    console.log(backgroundPositionOnDOM)
    this._currentLevel = level
    this._cameraPosition = this._storedBackgroundPositions[this._currentLevel]
                            || backgroundPositionOnDOM
    console.log(this._cameraPosition)
    this.updatePositionOnDOM()
    if(level === 'home') this.resetGym()
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
  get currentBackgroundPosition(): number[] {
    const { backgroundPositionX , backgroundPositionY } = this._backgroundElement.style
    const x = Number(backgroundPositionX.substring(0, backgroundPositionX.length - 2))
    const y = Number(backgroundPositionY.substring(0, backgroundPositionY.length - 2))
    return [x, y]
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
