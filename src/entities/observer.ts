export abstract class Observer {
  private _isReadyToUpdate: boolean
  constructor() {
    this._isReadyToUpdate = false
  }
  abstract handleUpdate (): void

  set isReadyToUpdate (isReady: boolean) {
    this._isReadyToUpdate = isReady;
  }
  get isReadyToUpdate (): boolean {
    return this._isReadyToUpdate
  }
  update(): void {
    if(!this._isReadyToUpdate) return
    this.handleUpdate()
  }
}
