import { Task } from "./"

export class TaskQueue {
  private _tasks: Array<Task>
  constructor() {
    this._tasks = []
  }
  get currentTask () {
    return this._tasks[0] || null
  }
  get isTaskAvailable () {
    return !!this._tasks[0]
  }
  addTask(task: Task): void {
    this._tasks.push(task)
  }
  endCurrentTask(): void {
    this._tasks.shift()
  }
}
