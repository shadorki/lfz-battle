import { Sprite } from '../helpers'
import { Observer } from './'

export class Player extends Observer {
  public sprite: Sprite
  constructor(name: string, path: string, grid: Array<number>) {
    super()
    this.sprite = new Sprite(name, path, grid)
  }
  handleUpdate(): void {
    console.log('meow')
  }
  async init(): Promise<void> {
    await this.sprite.init()
    console.log(this.sprite)
  }
}
