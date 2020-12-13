import { Task, TaskQueue } from "./helpers";
import { KeyTable } from './interfaces'
export default class Input {
  taskQueue: TaskQueue
  keyTable: KeyTable
  constructor(taskQueue: TaskQueue) {
    this.taskQueue = taskQueue
    this.keyTable = {
      'w': ['movement', 'up'],
      'a': ['movement', 'left'],
      's': ['movement', 'down'],
      'd': ['movement', 'right']
    }
  }
  handleInput({ key }: KeyboardEvent): void {
    if(!this.keyTable[key]) return
    const [ name, action ] = this.keyTable[key]
    this.taskQueue.addTask(new Task(name, action))
  }
  init(): void {
    window.addEventListener('keydown', this.handleInput.bind(this))
  }
}
