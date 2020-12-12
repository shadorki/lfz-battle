import Observer from './entities/observer'

export default class Engine {
  private _observers: Array<Observer>
  private _intervalId: number
  constructor() {
    this._observers = []
    this._intervalId = null
  }
  addObserver(observer: Observer): void {
    this._observers.push(observer)
  }
  removeObserver(observer: Observer): void {
    this._observers = this._observers.filter(o => o !== observer)
  }
  loop(): void {
    this._observers.forEach(o => o.update())
  }
  start(): void {
    this._intervalId = window.setInterval(this.loop.bind(this), 1000/60)
  }
  stop(): void {
    clearInterval(this._intervalId)
  }
  init(): void {
  }
}
