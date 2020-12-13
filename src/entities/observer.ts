import { Task } from "../helpers"

export abstract class Observer {
  abstract handleUpdate (task: Task): void

  update(task: Task): void {
    this.handleUpdate(task)
  }
}
