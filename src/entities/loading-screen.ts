import { Observer } from "."
import { Task } from "../helpers"
import { LoadingView } from "../render/views"

export class LoadingScreen extends Observer {
  private _view: LoadingView
  constructor(view: LoadingView) {
    super()
    this._acceptedTasks = new Set(['start-game'])
    this._view = view
  }
  handleUpdate({ name }: Task): void {
    switch (name) {
      case 'start-game':
        this.handleStartGame()
      break;
    }
  }
  handleStartGame(): void {
    this.hide()
  }
  set message(text: string) {
    this._view.setMessage(text)
  }
  show() {
    this._view.show()
  }
  hide() {
    this._view.hide()
  }
}
