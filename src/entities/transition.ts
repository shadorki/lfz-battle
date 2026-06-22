import { Observer } from './'
import { Delay, Task, TaskQueue } from '../helpers'
import { FadeView } from '../render/views'

export class Transition extends Observer {
  private _view: FadeView
  private _taskQueue: TaskQueue
  constructor(taskQueue: TaskQueue, view: FadeView) {
    super()
    this._acceptedTasks = new Set(['scene-transition-start', 'scene-transition-end', 'start-game'])
    this._view = view
    this._taskQueue = taskQueue
  }
  handleUpdate({ name }: Task): void {
    switch (name) {
      case 'scene-transition-start':
        this.handleSceneTransitionStart()
      break;
      case 'scene-transition-end':
        this.handleSceneTransitionEnd()
      break;
      case 'start-game':
        this.handleStartGame()
      break;
    }
  }
  handleStartGame() {
    this.hide()
  }
  async handleSceneTransitionStart() {
    this.show()
    await Delay.delay(1000)
    this._taskQueue.addTask(
      new Task(
        'scene-transition-end',
        null
      )
    )
  }
  handleSceneTransitionEnd() {
    this.hide()
  }
  show(): void {
    this._view.show()
  }
  hide(): void {
    this._view.hide()
  }
}
