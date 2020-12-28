import Engine from './engine'
import { Camera, Player, Level, Input, NPCManager, Dialogue, Transition, Sound, LoadingScreen } from './entities'
import Battle from './entities/battle'
import { TaskQueue } from './helpers'

export default class Game {
  $root: HTMLElement
  engine: Engine
  input: Input
  taskQueue: TaskQueue
  loadingScreen: LoadingScreen
  level: Level
  npcManager: NPCManager
  dialogue: Dialogue
  camera: Camera
  player: Player
  battle: Battle
  transition: Transition
  sound: Sound
  constructor() {
    this.$root = document.getElementById('root')
    this.taskQueue = new TaskQueue()
    this.loadingScreen = new LoadingScreen()
    this.engine = new Engine(this.taskQueue)
    this.level = new Level('home', this.$root)
    this.npcManager = new NPCManager('home', this.$root)
    this.camera = new Camera(this.taskQueue, 640, 384, this.$root, 'home')
    this.dialogue = new Dialogue(this.taskQueue, 'home')
    this.battle = new Battle(this.taskQueue, 'home')
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
    this.transition = new Transition(this.taskQueue)
    this.sound = new Sound('home')
  }
  setupDOM(...args: Array<HTMLElement>) {
    this.$root.append(...args)
  }
  async start(): Promise<void> {
    this.loadingScreen.message = 'Loading Maps...'
    const playerSpawnPoint = await this.level.init()
    this.loadingScreen.message = 'Loading Player...'
    const playerElement = await this.player.init(playerSpawnPoint)
    this.loadingScreen.message = 'Loading NPCs...'
    await this.npcManager.loadNPCImages()
    const npcElements = await this.npcManager.init()
    this.loadingScreen.message = 'Loading Sounds...'
    await this.sound.init()
    this.loadingScreen.message = 'Loading Game...'
    const cameraElement = this.camera.init(this.player)
    const dialogueElement = this.dialogue.init()
    this.setupDOM(playerElement, cameraElement, dialogueElement,...npcElements)
    this.engine.addObserver(this.transition)
    this.engine.addObserver(this.sound)
    this.engine.addObserver(this.camera)
    this.engine.addObserver(this.battle)
    this.engine.addObserver(this.player)
    this.engine.addObserver(this.dialogue)
    this.engine.addObserver(this.npcManager)
    this.engine.addObserver(this.level)
    this.engine.addObserver(this.input)
    this.engine.addObserver(this.loadingScreen)
    this.engine.start()
    this.input.init()
    this.loadingScreen.message = 'Press Space to Start'
  }
}
