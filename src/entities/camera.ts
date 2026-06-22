import { Task, TaskQueue } from '../helpers'
import { Observer } from './'
import { Levels, Movements, StoredBackgroundPositions } from '../interfaces'
import { Player } from './player'
import { CameraView } from '../render/views'

export class Camera extends Observer {
  private _visibleWidth: number
  private _visibleHeight: number
  private _playerBoundaries: number[]
  private _player: Player
  private _view: CameraView
  private _cameraPosition: number[]
  private _taskQueue: TaskQueue
  private _currentLevel: keyof Levels
  private _storedBackgroundPositions: StoredBackgroundPositions
  constructor(
    taskQueue: TaskQueue,
    width: number,
    height: number,
    view: CameraView,
    currentLevel: keyof Levels
  ) {
    super()
    this._taskQueue = taskQueue
    this._storedBackgroundPositions = {}
    this._currentLevel = currentLevel
    this._acceptedTasks = new Set(['movement', 'scene-transition-start'])
    this._visibleWidth = width
    this._visibleHeight = height
    this._playerBoundaries = [512, 96, 256, 128]
    this._player = null
    this._view = view
    this._cameraPosition = [0, 0]
  }
  handleUpdate({ name, action }: Task): void {
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
    const [ left, top ] = this._player.screenPos
    const [ maxLeft, maxRight, maxTop, maxBottom] = this._playerBoundaries
    let selectedMovement: keyof Movements = null
    if (left > maxLeft) {
      selectedMovement = 'left'
    } else if (left < maxRight) {
      selectedMovement = 'right'
    } else if (top >= maxTop) {
      selectedMovement = 'up'
    } else if (top < maxBottom) {
      selectedMovement = 'down'
    }
    if (!selectedMovement) return
    this._player.updateScreenPos(selectedMovement)
    this.moveCamera(selectedMovement)
    this._taskQueue.addTask(new Task('npc-movement', selectedMovement))
  }
  handleSceneTransitionStart(action: any) {
    this._storedBackgroundPositions[this._currentLevel] = this.currentBackgroundPosition
    const {
      backgroundPositionOnDOM,
      level
    } = action
    this._currentLevel = level
    this._cameraPosition = this._storedBackgroundPositions[this._currentLevel]
                            || backgroundPositionOnDOM
    this.updateScroll(true) // snap under the transition fade
    if (level === 'home') this.resetGym()
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
    this.updateScroll()
  }
  updateScroll(immediate = false): void {
    const [x, y] = this._cameraPosition
    this._view.setScroll(x, y, immediate)
  }
  get currentBackgroundPosition(): number[] {
    return [...this._cameraPosition]
  }
  init(player: Player): void {
    this._player = player
    this.updateScroll(true)
  }
}
