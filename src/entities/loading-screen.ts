import { Observer } from "."
import { Task } from "../helpers"

export class LoadingScreen extends Observer {
  private _container: HTMLElement
  private _message: HTMLElement
  constructor() {
    super()
    this._acceptedTasks = new Set(['start-game'])
    this._container = document.getElementById('loading-screen')
    this._message = <HTMLElement>this._container.firstElementChild
  }
  handleUpdate({ name }: Task): void {
    switch(name) {
      case 'start-game':
        this.handleStartGame()
      break;
    }
  }
  handleStartGame(): void {
    this.hide()
  }
  get message (): string {
    return this._message.textContent
  }
  set message(text: string) {
    this._message.textContent = text
  }
  show() {
    this._container.style.opacity = '1'
  }
  hide() {
    this._container.style.opacity = '0'
  }
}
