import Engine from './engine'
import { Player } from './entities'

export default class Game {
  $root: HTMLElement
  engine: Engine
  player: Player
  constructor() {
    this.$root = document.getElementById('root')
    this.engine = new Engine()
    this.player = new Player('MC', './assets/images/players/player.png', [4, 6])
  }
  setupDOM(...args: Array<HTMLElement>) {
    this.$root.append(...args)
  }
  async start(): Promise<void> {
    const playerElement = await this.player.init()
    this.setupDOM(playerElement)
    this.engine.addObserver(this.player)
    this.engine.start()
  }
}
