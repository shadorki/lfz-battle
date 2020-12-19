import Engine from './engine'
import { Camera, Player, Level, Input, NPCManager, Dialogue } from './entities'
import { TaskQueue } from './helpers'

export default class Game {
  $root: HTMLElement
  engine: Engine
  input: Input
  taskQueue: TaskQueue
  level: Level
  npcManager: NPCManager
  dialogue: Dialogue
  camera: Camera
  player: Player
  constructor() {
    this.$root = document.getElementById('root')
    this.taskQueue = new TaskQueue()
    this.engine = new Engine(this.taskQueue)
    this.level = new Level('home', this.$root)
    this.npcManager = new NPCManager('home', this.$root)
    this.camera = new Camera(this.taskQueue, 640, 384, this.$root, 'home')
    this.dialogue = new Dialogue(this.taskQueue, 'home')
    this.player = new Player(
      'MC',
      './assets/images/players/player.png',
      [4, 6],
      this.taskQueue,
      'home',
      this.level.isSceneTransition.bind(this.level),
      this.level.getSceneTransition.bind(this.level),
      this.level.isInteraction.bind(this.level),
      this.level.getInteraction.bind(this.level),
      this.level.isSpaceWalkable.bind(this.level)
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
    const dialogueElement = this.dialogue.init()
    this.setupDOM(playerElement, cameraElement, dialogueElement,...npcElements)
    this.input.init()
    this.engine.addObserver(this.camera)
    this.engine.addObserver(this.player)
    this.engine.addObserver(this.dialogue)
    this.engine.addObserver(this.npcManager)
    this.engine.addObserver(this.level)
    this.engine.addObserver(this.input)
    this.engine.start()
  }
}
