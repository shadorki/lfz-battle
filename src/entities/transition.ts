import { Observer } from './'
import { Delay, Task, TaskQueue } from '../helpers'

export class Transition extends Observer {
  private _domElement: HTMLElement
  private _taskQueue: TaskQueue
  constructor(taskQueue: TaskQueue) {
    super()
    this._acceptedTasks = new Set(['scene-transition-start', 'scene-transition-end'])
    this._domElement = document.getElementById('transition')
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
    }
  }
  async handleSceneTransitionStart() {
    this.show()
    await Delay.delay(500)
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
    this._domElement.style.opacity = '1'
  }
  hide(): void {
    this._domElement.style.opacity = '0'
  }
}
