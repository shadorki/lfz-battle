import { Task, TaskQueue } from '../helpers'
import { Observer } from './'
import { Levels, Movements, Position, StoredBackgroundPositions } from '../interfaces'
import { PlayerView, TILE_WIDTH, TILE_HEIGHT } from '../render/views'

export class Player extends Observer {
  public view: PlayerView
  /** Tile size in screen pixels (one tile == one player frame). */
  public readonly width = TILE_WIDTH
  public readonly height = TILE_HEIGHT
  public getSceneTransition: Function
  public isSpaceWalkable: Function
  public isSceneTransition: Function
  public isInteraction: Function
  public getInteraction: Function
  private _taskQueue: TaskQueue
  private _position: Position
  /** Player position in viewport pixels (top-left origin). Was DOM left/top. */
  private _screen: { left: number; top: number }
  private _currentLevel: keyof Levels
  private _storedBackgroundPositions: StoredBackgroundPositions
  private _currentFacingPosition: keyof Movements
  constructor(
    taskQueue: TaskQueue,
    currentLevel: keyof Levels,
    view: PlayerView,
    isSceneTransition: Function,
    getSceneTransition: Function,
    isInteraction: Function,
    getInteraction: Function,
    isSpaceWalkable: Function
  ) {
    super()
    this.view = view
    this._taskQueue = taskQueue
    this._currentLevel = currentLevel
    this._storedBackgroundPositions = {}
    this._acceptedTasks = new Set(['movement', 'scene-transition-start', 'interaction'])
    this._position = null
    this._screen = { left: 0, top: 0 }
    this._currentFacingPosition = 'down'
    this.getSceneTransition = getSceneTransition
    this.isSpaceWalkable = isSpaceWalkable
    this.isSceneTransition = isSceneTransition
    this.isInteraction = isInteraction
    this.getInteraction = getInteraction
  }
  handleUpdate({ name, action }: Task): void {
    if (!this._acceptedTasks.has(name)) return
    switch (name) {
      case 'movement':
        this.handleMovement(action as keyof Movements)
      break
      case 'scene-transition-start':
        this.handleSceneTransitionStart(action)
      break
      case 'interaction':
        this.handleInteraction()
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
      'gymArena6'
    ].forEach(l => delete this._storedBackgroundPositions[l])
  }
  getTargetedPosition(direction: keyof Movements): Position {
    const position: Position = { ...this._position }
    const movements: Movements = {
      up: p => p.y--,
      down: p => p.y++,
      left: p => p.x--,
      right: p => p.x++
    }
    movements[direction](position)
    return position
  }
  handleMovement(direction: keyof Movements): void {
    const position = this.getTargetedPosition(direction)
    const { x, y } = position
    this.setFacingPosition(direction)
    if (this.isSpaceWalkable(x, y)) {
      this.view.playAnimation(direction)
      this._position = position
      this.updateScreenPos(direction)
      if (this.isSceneTransition(x, y)) {
        this._taskQueue.addTask(
          new Task(
            'scene-transition-start',
            this.getSceneTransition(x, y)
          )
        )
      }
    } else {
      this._taskQueue.addTask(new Task('wall-bump'))
    }
  }
  handleSceneTransitionStart(action: any) {
    this._storedBackgroundPositions[this._currentLevel] = this.screenPos
    const {
      playerPositionOnDOM,
      playerPosition,
      playerFacingPosition,
      level
    } = action
    this._currentLevel = level
    const [x, y] = this._storedBackgroundPositions[this._currentLevel]
                    || playerPositionOnDOM
    this.setFacingPosition(playerFacingPosition)
    this._position = playerPosition
    this.setScreenPos(x, y, true) // snap under the transition fade
    if (level === 'home') this.resetGym()
  }
  handleInteraction(): void {
    const { x, y } = this.getTargetedPosition(this._currentFacingPosition)
    if (!this.isInteraction(x, y)) return
    const interaction = this.getInteraction(x, y)
    this._taskQueue.addTask(new Task(
      `${interaction.type}-interaction-start`,
      {
        playerFacingPosition: this._currentFacingPosition,
        ...interaction
      }
    ))
  }
  updateScreenPos(direction: keyof Movements): void {
    let { left, top } = this._screen
    const movements: Movements = {
      up: () => top -= this.height,
      down: () => top += this.height,
      left: () => left -= this.width,
      right: () => left += this.width
    }
    movements[direction]()
    this.setScreenPos(left, top)
  }
  setFacingPosition(direction: keyof Movements): void {
    this._currentFacingPosition = direction
    this.view.setFacing(direction)
  }
  get screenPos(): number[] {
    return [this._screen.left, this._screen.top]
  }
  setScreenPos(left: number, top: number, immediate = false): void {
    this._screen = { left, top }
    this.view.setPosition(left, top, immediate)
  }
  setInitialScreenPos(): void {
    const { x, y } = this._position
    this.setScreenPos(x * this.width, y * this.height, true)
  }
  init(startingPosition: Position): void {
    this._position = startingPosition
    this.setFacingPosition('down')
    this.setInitialScreenPos()
  }
}
