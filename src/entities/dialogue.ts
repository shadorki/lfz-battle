import { Observer } from './'

export class Dialogue extends Observer {
  public containerElement: HTMLElement
  public headingElement: HTMLElement
  public contentElement: HTMLElement
  private _isShowing: boolean
  constructor() {
    super()
    this._isShowing = false
    this.containerElement = null
    this.headingElement = null
    this.contentElement = null
  }
  get isShowing(): boolean {
    return this._isShowing
  }
  set isShowing(bool: boolean) {
    this._isShowing = bool
    if(this._isShowing) {
      this.containerElement.style.bottom = '20px'
      this.containerElement.style.opacity = '1'
    } else {
      this.containerElement.style.bottom = '-115px'
      this.containerElement.style.opacity = '0'
    }
  }
  createElement(): HTMLElement {
    const container = document.createElement('div')
    container.style.width = '500px'
    container.style.height = '100px'
    container.style.bottom = '20px -115px'
    container.style.opacity = '0'
    container.style.position = 'absolute'
    container.style.border = '6px solid darkbrown'
    container.style.borderRadius = '6px'
    container.style.backgroundColor = 'beige'
    container.style.transition = 'bottom 300ms, opacity 300ms'
    return container
  }
}
