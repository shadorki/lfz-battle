export default abstract class Observer {
  private _isReadyToUpdate: boolean
  private _handleUpdate: Function
  constructor(handleUpdate: Function) {
    this._isReadyToUpdate = false
    this._handleUpdate = handleUpdate
  }
  set isReadyToUpdate (isReady: boolean) {
    this._isReadyToUpdate = isReady;
  }
  get isReadyToUpdate (): boolean {
    return this._isReadyToUpdate
  }
  update(): void {
    if(!this._isReadyToUpdate) return
    this._handleUpdate()
  }
}
