import Engine from './engine'
import { Player } from './entities'

export default class Game {
  engine: Engine
  player: Player
  constructor() {
    this.engine = new Engine()
    this.player = new Player('MC', './assets/images/players/player.png', [4, 4])
  }
  async start(): Promise<void> {
    await this.player.init()
    this.engine.addObserver(this.player)
    this.engine.start()
  }
}
