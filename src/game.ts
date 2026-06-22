import Engine from './engine'
import { Camera, Player, Level, Input, Transition, MapRenderer, NPCManager, Dialogue, LoadingScreen, Sound } from './entities'
import Battle from './entities/battle'
import { TaskQueue } from './helpers'
import { levels } from './data'
import { PixiApp, VIEW_WIDTH, VIEW_HEIGHT } from './render/pixi-app'
import { PixiPlayerView } from './render/pixi-player-view'
import { PixiCameraView } from './render/pixi-camera-view'
import { PixiMapView, loadMapTexture, drawCollisionOverlay } from './render/pixi-map-view'
import { PixiFadeView } from './render/pixi-fade-view'
import { PixiNpcView } from './render/pixi-npc-view'
import { PixiDialogueView } from './render/pixi-dialogue-view'
import { PixiLoadingView } from './render/pixi-loading-view'
import { createPixiBattle } from './render/pixi-battle'
import { loadPlayerTextures } from './render/player-textures'
import { mapUrlForPath, spriteUrlForPath, audioUrlForPath, loadFonts } from './render/assets'

/** Toggle to overlay the collision grid on the map for alignment debugging. */
const DEBUG_COLLISION = false

/**
 * Full Pixi client — title/loading gate, map art, player + NPC sprites, scene
 * transitions, dialogue, quiz battles, and sound — driven by the original
 * Input -> TaskQueue -> Engine -> Observer pipeline. Game logic is unchanged;
 * only the rendering layer was swapped from DOM to Pixi.
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

    // Pixel fonts must be ready before any Text rasterizes.
    await loadFonts()

    // Loading/boot overlay (topmost). Shown while assets load, then gates the
    // game on a space press.
    const loadingView = new PixiLoadingView()
    this.pixi.overlay.addChild(loadingView.root)
    const loadingScreen = new LoadingScreen(loadingView)
    loadingScreen.show()
    // Bump the loading text to the on-screen resolution now (it persists across
    // setMessage), so the "Loading…" messages are crisp, not just the final one.
    this.pixi.fit()

    // Load art before building views.
    loadingScreen.message = 'Loading Maps...'
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

    // Battle scene (overlay layer, full-screen; added before the fade so the
    // scene-transition fade stays on top).
    loadingScreen.message = 'Loading Battle...'
    const battleScene = await createPixiBattle(this.pixi.overlay)
    const battle = new Battle(this.taskQueue, 'home', battleScene.components)

    // Sound (audio; starts muted — press 'm' to toggle).
    loadingScreen.message = 'Loading Sounds...'
    const sound = new Sound('home', audioUrlForPath)
    await sound.init()

    // Scene-transition support: fade overlay + map swapper.
    const fadeView = new PixiFadeView()
    this.pixi.overlay.addChild(fadeView.root)
    const transition = new Transition(this.taskQueue, fadeView)
    const mapRenderer = new MapRenderer(mapView, (level: string) => mapUrlForPath(levels[level].path))

    // Observer order matches the legacy game: transition first; camera reads the
    // player's pre-move position each tick, then the player moves.
    this.engine.addObserver(transition)
    this.engine.addObserver(sound)
    this.engine.addObserver(this.camera)
    this.engine.addObserver(battle)
    this.engine.addObserver(this.player)
    this.engine.addObserver(mapRenderer)
    this.engine.addObserver(npcManager)
    this.engine.addObserver(dialogue)
    this.engine.addObserver(this.level)
    this.engine.addObserver(loadingScreen)
    this.engine.addObserver(this.input)

    // Drive the engine + view easing from Pixi's ticker — a single game clock.
    this.pixi.onTick(deltaMS => {
      this.engine.loop()
      playerView.update(deltaMS)
      cameraView.update(deltaMS)
      dialogueView.update()
      battleScene.update()
      fadeView.update()
    })

    // Keep the loading overlay on top of the now-added battle/fade layers.
    this.pixi.overlay.addChild(loadingView.root)

    // Apply crisp text resolution to all now-created Text, and fit to window.
    this.pixi.fit()

    this.input.init()
    // Boot gate: Input starts in 'loading' mode (space -> start-game, which the
    // LoadingScreen hides on and switches Input to walking).
    loadingScreen.message = 'Press Space to Start'
  }
}
