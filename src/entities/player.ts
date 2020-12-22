import { Animator, Sprite, Task, TaskQueue } from '../helpers'
import { Observer } from './'
import { Levels, Movements, PlayerFacingPositions, Position, StoredBackgroundPositions } from '../interfaces'

export class Player extends Observer {
  public sprite: Sprite
  public animator: Animator
  public domElement: HTMLElement
  public width: number
  public height: number
  public getSceneTransition: Function
  public isSpaceWalkable: Function
  public isSceneTransition: Function
  public isInteraction: Function
  public getInteraction: Function
  private _taskQueue: TaskQueue
  private _acceptedTasks: Set<string>
  private _position: Position
  private _playerFacingPositions: PlayerFacingPositions
  private _currentLevel: keyof Levels
  private _storedBackgroundPositions: StoredBackgroundPositions
  private _currentFacingPosition: keyof PlayerFacingPositions
  constructor(
    name: string,
    path: string,
    grid: number[],
    taskQueue: TaskQueue,
    currentLevel: keyof Levels,
    isSceneTransition: Function,
    getSceneTransition: Function,
    isInteraction: Function,
    getInteraction: Function,
    isSpaceWalkable: Function
  ) {
    super()
    this.sprite = new Sprite(name, path, grid)
    this.animator = null
    this.domElement = null
    this.width = null
    this.height = null
    this._taskQueue = taskQueue
    this._currentLevel = currentLevel
    this._storedBackgroundPositions = {}
    this._acceptedTasks = new Set(['movement', 'scene-transition-start', 'interaction'])
    this._position = null
    this._playerFacingPositions = null
    this._currentFacingPosition = 'down'
    this.getSceneTransition = getSceneTransition
    this.isSpaceWalkable = isSpaceWalkable
    this.isSceneTransition = isSceneTransition
    this.isInteraction = isInteraction
    this.getInteraction = getInteraction
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
    if(!this.isSpaceWalkable(x, y)) return
    this.animator.play(direction)
    this._position = position
    this.updatePositionOnDOM(direction)
    if(this.isSceneTransition(x, y)) {
      this._taskQueue.addTask(
        new Task(
          'scene-transition-start',
          this.getSceneTransition(x, y)
        )
      )
      this._taskQueue.addTask(
        new Task(
          'scene-transition-end',
          null
        )
      )
    }
  }
  handleSceneTransitionStart(action: any) {
    this._storedBackgroundPositions[this._currentLevel] = this.playerPositionOnDOM
    this._storedBackgroundPositions[this._currentLevel]
    const {
      playerPositionOnDOM,
      playerPosition,
      playerFacingPosition,
      level
    } = action
    this._currentLevel = level
    console.log(this._storedBackgroundPositions[this._currentLevel])
    const [x, y] = this._storedBackgroundPositions[this._currentLevel]
                    || playerPositionOnDOM
    this.setFacingPosition(playerFacingPosition)
    this._position = playerPosition
    this.setPlayerPositionOnDom(x, y)
    if(level === 'home') this.resetGym()
  }
  handleInteraction(): void {
    const { x, y } = this.getTargetedPosition(this._currentFacingPosition)
    if(!this.isInteraction(x, y)) return
    const interaction = this.getInteraction(x, y)
    this._taskQueue.addTask(new Task(
      `${interaction.type}-interaction-start`,
      {
        playerFacingPosition: this._currentFacingPosition,
        ...interaction
      }
    ))
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
    this.setPlayerPositionOnDom(left, top)
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
    this.domElement.style.left = `${x}px`
    this.domElement.style.top = `${y}px`
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
