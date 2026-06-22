import Engine from './engine'
import { Camera, Player, Level, Input, Transition, MapRenderer, NPCManager, Dialogue } from './entities'
import { Task, TaskQueue } from './helpers'
import { levels } from './data'
import { PixiApp, VIEW_WIDTH, VIEW_HEIGHT } from './render/pixi-app'
import { PixiPlayerView } from './render/pixi-player-view'
import { PixiCameraView } from './render/pixi-camera-view'
import { PixiMapView, loadMapTexture, drawCollisionOverlay } from './render/pixi-map-view'
import { PixiFadeView } from './render/pixi-fade-view'
import { PixiNpcView } from './render/pixi-npc-view'
import { PixiDialogueView } from './render/pixi-dialogue-view'
import { loadPlayerTextures } from './render/player-textures'
import { mapUrlForPath, spriteUrlForPath } from './render/assets'

/** Toggle to overlay the collision grid on the map for alignment debugging. */
const DEBUG_COLLISION = false

/**
 * Milestone 4a wiring: a Pixi canvas rendering real map art + player sprite,
 * with working scene transitions (doors swap maps under a fade), driven by the
 * existing Input -> TaskQueue -> Engine -> Observer pipeline. NPCs/dialogue/
 * battle return in M4b+. Game logic is unchanged; only rendering is new.
 */
export default class Game {
  pixi: PixiApp
  engine: Engine
  input: Input
  taskQueue: TaskQueue
  level: Level
  camera!: Camera
  player!: Player

  constructor() {
    this.pixi = new PixiApp()
    this.taskQueue = new TaskQueue()
    this.engine = new Engine(this.taskQueue)
    // Pixi path doesn't use a DOM root; pass a detached element for the
    // (unused here) legacy DOM methods on Level.
    this.level = new Level('home', document.createElement('div'))
    this.input = new Input(this.taskQueue)
  }

  async start(): Promise<void> {
    const mount = document.getElementById('app')!
    await this.pixi.init(mount)

    // Load art before building views.
    const [playerTextures, mapTexture] = await Promise.all([
      loadPlayerTextures(),
      loadMapTexture(mapUrlForPath(this.level.grid.path))
    ])

    // Map background (world space, scrolled by the camera). MapRenderer swaps
    // its texture on scene transitions.
    const mapView = new PixiMapView(mapTexture)
    this.pixi.world.addChild(mapView.root)
    if (DEBUG_COLLISION) {
      this.pixi.world.addChild(drawCollisionOverlay(this.level.grid))
    }

    // NPCs (world space, above the map; scroll with it). Rebuilt per level.
    const npcView = new PixiNpcView()
    this.pixi.world.addChild(npcView.root)
    const npcManager = new NPCManager(npcView, 'home', spriteUrlForPath)
    npcManager.init()

    // Player (viewport space) on the view seam.
    const playerView = new PixiPlayerView(playerTextures)
    this.pixi.ui.addChild(playerView.root)
    this.player = new Player(
      this.taskQueue,
      'home',
      playerView,
      this.level.isSceneTransition.bind(this.level),
      this.level.getSceneTransition.bind(this.level),
      this.level.isInteraction.bind(this.level),
      this.level.getInteraction.bind(this.level),
      this.level.isSpaceWalkable.bind(this.level)
    )
    this.player.init(this.level.grid.playerSpawnPoint)

    // Camera scrolls the world container.
    const cameraView = new PixiCameraView(this.pixi.world)
    this.camera = new Camera(this.taskQueue, VIEW_WIDTH, VIEW_HEIGHT, cameraView, 'home')
    this.camera.init(this.player)

    // Dialogue box (ui layer, above the player).
    const dialogueView = new PixiDialogueView()
    this.pixi.ui.addChild(dialogueView.root)
    const dialogue = new Dialogue(this.taskQueue, 'home', dialogueView)

    // Scene-transition support: fade overlay + map swapper.
    const fadeView = new PixiFadeView()
    this.pixi.overlay.addChild(fadeView.root)
    const transition = new Transition(this.taskQueue, fadeView)
    const mapRenderer = new MapRenderer(mapView, (level: string) => mapUrlForPath(levels[level].path))

    // Observer order matches the legacy game: transition first; camera reads the
    // player's pre-move position each tick, then the player moves.
    this.engine.addObserver(transition)
    this.engine.addObserver(this.camera)
    this.engine.addObserver(this.player)
    this.engine.addObserver(mapRenderer)
    this.engine.addObserver(npcManager)
    this.engine.addObserver(dialogue)
    this.engine.addObserver(this.level)
    this.engine.addObserver(this.input)

    // Drive the engine + view easing from Pixi's ticker — a single game clock.
    this.pixi.onTick(() => {
      this.engine.loop()
      playerView.update()
      cameraView.update()
      dialogueView.update()
      fadeView.update()
    })

    this.input.init()
    // Skip the press-space-to-start gate (returns in M4e): go straight to walking.
    this.taskQueue.addTask(new Task('start-game'))
  }
}
