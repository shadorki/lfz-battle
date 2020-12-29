export class Screen {
  private _root: HTMLElement
  private _width: number
  private _height: number
  constructor(root: HTMLElement) {
    this._root = root
    this._width = 640
    this._height = 384
  }
  adjustScreen({ currentTarget }: Event) {
    const { innerHeight, innerWidth } = currentTarget as Window
    const calculatedHeight = (innerHeight * .9) / this._height
    const calculatedWidth = (innerWidth * .9) / this._width
    this._root.style.transform = `scale(${calculatedHeight > calculatedWidth ? calculatedWidth : calculatedHeight})`
  }
  init() {
    const { innerHeight, innerWidth } = window
    const calculatedHeight = (innerHeight * .9) / this._height
    const calculatedWidth = (innerWidth * .9) / this._width
    this._root.style.transform = `scale(${calculatedHeight > calculatedWidth ? calculatedWidth : calculatedHeight})`
    window.addEventListener('resize', this.adjustScreen.bind(this))
  }
}
