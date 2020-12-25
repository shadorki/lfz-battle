import { Task } from "../helpers"

export abstract class Observer {
  public _acceptedTasks: Set<string>
  abstract handleUpdate (task: Task): void

  update(task: Task): void {
    if (!this._acceptedTasks.has(task.name)) return
    this.handleUpdate(task)
  }
}
