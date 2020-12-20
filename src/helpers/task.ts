export class Task {
  public name: string
  public action: any
  constructor(name: string, action: any = null) {
    this.name = name
    this.action = action
  }
}
