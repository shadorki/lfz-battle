import Engine from './engine'
import { Player } from './entities'
import { TaskQueue } from './helpers'
import Input from './input'
import Level from './level'

export default class Game {
  $root: HTMLElement
  engine: Engine
  player: Player
  input: Input
  taskQueue: TaskQueue
  level: Level
  constructor() {
    this.$root = document.getElementById('root')
    this.taskQueue = new TaskQueue()
    this.engine = new Engine(this.taskQueue)
    this.level = new Level('Level1', this.$root)
    this.player = new Player(
      'MC',
      './assets/images/players/player.png',
      [4, 6],
      {
        x: 4,
        y: 1
      },
      this.level.isSpaceWalkable.bind(this.level)
    )
    this.input = new Input(this.taskQueue)
  }
  setupDOM(...args: Array<HTMLElement>) {
    this.$root.append(...args)
  }
  async start(): Promise<void> {
    const playerElement = await this.player.init()
    this.input.init()
    this.setupDOM(playerElement)
    this.engine.addObserver(this.player)
    this.engine.start()
  }
}
