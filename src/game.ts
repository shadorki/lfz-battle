import Engine from './engine'
import { Camera, Player, Level, Input, NPCManager } from './entities'
import { TaskQueue } from './helpers'

export default class Game {
  $root: HTMLElement
  engine: Engine
  input: Input
  taskQueue: TaskQueue
  level: Level
  npcManager: NPCManager
  camera: Camera
  player: Player
  constructor() {
    this.$root = document.getElementById('root')
    this.taskQueue = new TaskQueue()
    this.engine = new Engine(this.taskQueue)
    this.level = new Level('home', this.$root)
    this.npcManager = new NPCManager('home')
    this.camera = new Camera(this.taskQueue, 640, 320, this.$root)
    this.player = new Player(
      'MC',
      './assets/images/players/player.png',
      [4, 6],
      this.taskQueue,
      this.level.getSceneTransition.bind(this.level),
      this.level.isSpaceWalkable.bind(this.level),
      this.level.isSceneTransition.bind(this.level)
    )
    this.input = new Input(this.taskQueue)
  }
  setupDOM(...args: Array<HTMLElement>) {
    this.$root.append(...args)
  }
  async start(): Promise<void> {
    const playerSpawnPoint = this.level.init()
    const playerElement = await this.player.init(playerSpawnPoint)
    const npcElements = await this.npcManager.init()
    const cameraElement = this.camera.init(this.player)
    this.setupDOM(playerElement, cameraElement, ...npcElements)
    this.input.init()
    this.engine.addObserver(this.player)
    this.engine.addObserver(this.level)
    this.engine.addObserver(this.camera)
    this.engine.addObserver(this.input)
    this.engine.addObserver(this.npcManager)
    this.engine.start()
  }
}
