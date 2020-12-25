import { Task, TaskQueue } from "../helpers";
import { KeyTable } from '../interfaces'
import { Observer } from "./";
export class Input extends Observer {
  private _isDisabled: boolean
  private _currentMode: keyof KeyTable
  private _movementKeys: Set<string>
  private _taskQueue: TaskQueue
  private _keyTable: KeyTable
  private _walkingInterval: number
  private _isWalking: boolean
  constructor(taskQueue: TaskQueue) {
    super()
    this._isDisabled = true
    this._isWalking = false
    this._acceptedTasks = new Set([
      'npc-interaction-start',
      'npc-interaction-end',
      'scene-transition-start',
      'scene-transition-end',
      'battle-start',
      'battle-navigate-answer',
      'disable-input',
      'enable-input',
      'simulate-input',
      'start-game'
    ])
    this._currentMode = 'loading'
    this._taskQueue = taskQueue
    this._movementKeys = new Set(['w', 'a', 's', 'd'])
    this._keyTable = {
      loading: {
        ' ': ['start-game', null]
      },
      walking: {
        'w': ['movement', 'up'],
        'a': ['movement', 'left'],
        's': ['movement', 'down'],
        'd': ['movement', 'right'],
        ' ': ['interaction', null],
        'm': ['toggle-sound', null]
      },
      dialogue: {
        ' ': ['dialogue', null],
        'm': ['toggle-sound', null]
      },
      battle: {
        'w': ['battle', 'selectPreviousAnswer'],
        's': ['battle', 'selectNextAnswer'],
        ' ': ['battle', null],
        'm': ['toggle-sound', null]
      }
    }
  }
  get isDisabled(): boolean {
    return this._isDisabled
  }
  set isDisabled(bool: boolean) {
    this._isDisabled = bool
  }
  handleUpdate({ name, action }: Task): void {
    switch (name) {
      case 'scene-transition-start':
        this.handleSceneTransitionStart()
      break
      case 'scene-transition-end':
        this.handleSceneTransitionEnd()
      break
      case 'npc-interaction-start':
        this.handleNPCInteractionStart()
      break
      case 'npc-interaction-end':
        this.handleNPCInteractionEnd()
      break
      case 'battle-start':
        this.handleBattleStart()
      break
      case 'battle-navigate-answer':
        this.handleBattleNavigateAnswer()
      break
      case 'disable-input':
        this.handleDisableInput()
      break
      case 'enable-input':
        this.handleEnableInput()
      break
      case 'simulate-input':
        this.handleSimulateInput(action)
        break
      case 'start-game':
        this.handleStartGame()
        break
    }
  }
  handleStartGame(): void {
    this._currentMode = 'walking'
  }
  handleSimulateInput(key: string) {
    this.handleInput({ key } as KeyboardEvent)
  }
  handleDisableInput() {
    this.isDisabled = true
  }
  handleEnableInput() {
    this.isDisabled = false
  }
  handleBattleNavigateAnswer(): void {
    this.isDisabled = false
    this._currentMode = 'battle'
  }
  handleBattleStart() {
    this.isDisabled = true
  }
  handleNPCInteractionEnd() {
    this._currentMode = 'walking'
  }
  handleNPCInteractionStart(): void {
    this._currentMode = 'dialogue'
  }
  handleSceneTransitionStart(): void {
    this.isDisabled = true
  }
  handleSceneTransitionEnd(): void {
    this.isDisabled = false
  }
  handleInput({ key }: KeyboardEvent): void {
    if(this.isDisabled) return
    const keyTable = this._keyTable[this._currentMode]
    if(!keyTable[key]) return
    const [ name, action ] = keyTable[key]
    if(name === 'movement' && this._isWalking) return
    this._taskQueue.addTask(new Task(name, action))
    if (name === 'movement') this.startWalkingLoop(name, action)
  }
  handleWalkingLogic({ key }: KeyboardEvent) {
    if(this._movementKeys.has(key)) {
      this.stopWalkingLoop()
    }
  }
  startWalkingLoop(name: any, action: any) {
    this._isWalking = true
    this._walkingInterval = window.setInterval(() => {
      if(this.isDisabled) return this.stopWalkingLoop()
      this._taskQueue.addTask(new Task(name, action))
    }, 200)
  }
  stopWalkingLoop() {
    clearInterval(this._walkingInterval)
    this._isWalking = false
  }
  init(): void {
    window.addEventListener('keydown', this.handleInput.bind(this))
    window.addEventListener('keyup', this.handleWalkingLogic.bind(this))
    this.isDisabled = false
  }
}
