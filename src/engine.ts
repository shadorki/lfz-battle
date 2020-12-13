import { Observer } from './entities'
import { TaskQueue } from './helpers'

export default class Engine {
  private _observers: Array<Observer>
  private _intervalId: number
  private _taskQueue: TaskQueue
  constructor(taskQueue: TaskQueue) {
    this._observers = []
    this._intervalId = null
    this._taskQueue = taskQueue
  }
  addObserver(observer: Observer): void {
    this._observers.push(observer)
  }
  removeObserver(observer: Observer): void {
    this._observers = this._observers.filter(o => o !== observer)
  }
  loop(): void {
    if(!this._taskQueue.isTaskAvailable) return
    this._observers.forEach(o => o.update(this._taskQueue.currentTask))
    this._taskQueue.endCurrentTask()
  }
  start(): void {
    this._intervalId = window.setInterval(this.loop.bind(this), 1000/60)
  }
  stop(): void {
    clearInterval(this._intervalId)
  }
  init(): void {
    this.start()
  }
}
