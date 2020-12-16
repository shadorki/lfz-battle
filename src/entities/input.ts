import { Task, TaskQueue } from "../helpers";
import { KeyTable } from '../interfaces'
import { Observer } from "./";
export class Input extends Observer {
  private _isDisabled: boolean
  private _acceptedTasks: Set<string>
  private _taskQueue: TaskQueue
  private _keyTable: KeyTable
  constructor(taskQueue: TaskQueue) {
    super()
    this._isDisabled = true
    this._acceptedTasks = new Set(['scene-transition-start', 'scene-transition-end'])
    this._taskQueue = taskQueue
    this._keyTable = {
      'w': ['movement', 'up'],
      'a': ['movement', 'left'],
      's': ['movement', 'down'],
      'd': ['movement', 'right']
    }
  }
  get isDisabled(): boolean {
    return this._isDisabled
  }
  set isDisabled(bool: boolean) {
    this._isDisabled = bool
  }
  handleUpdate({ name }: Task): void {
    if (!this._acceptedTasks.has(name)) return
    switch (name) {
      case 'scene-transition-start':
        this.handleSceneTransitionStart()
      break
      case 'scene-transition-end':
        this.handleSceneTransitionEnd()
      break
    }
  }
  handleSceneTransitionStart(): void {
    this.isDisabled = true
  }
  handleSceneTransitionEnd(): void {
    this.isDisabled = false
  }
  handleInput({ key }: KeyboardEvent): void {
    if(this.isDisabled) return
    if(!this._keyTable[key]) return
    const [ name, action ] = this._keyTable[key]
    this._taskQueue.addTask(new Task(name, action))
  }
  init(): void {
    window.addEventListener('keydown', this.handleInput.bind(this))
    this.isDisabled = false
  }
}
