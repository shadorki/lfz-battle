import { Sprite } from '../helpers'
import { Observer } from './'

export class Player extends Observer {
  public sprite: Sprite
  public domElement: HTMLElement
  constructor(name: string, path: string, grid: Array<number>) {
    super()
    this.sprite = new Sprite(name, path, grid)
    this.domElement = null
  }
  handleUpdate(): void {
    console.log('meow')
  }
  createElement(): HTMLElement {
    const element = document.createElement('div')
    const { path, sheet, width, height } = this.sprite
    const [[x, y]] = sheet
    element.style.backgroundImage = `url('${path}')`
    element.style.backgroundPosition = `${x}px ${y}px`
    element.style.backgroundRepeat = 'no-repeat'
    element.style.width = `${width}px`
    element.style.height = `${height}px`
    element.style.transform = 'scale(0.5)'
    return element
  }
  async init(): Promise<HTMLElement> {
    await this.sprite.init()
    this.domElement = this.createElement()
    return this.domElement
  }
}
