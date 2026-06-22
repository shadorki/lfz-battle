import { Application, Container } from 'pixi.js'

/** Internal render resolution — matches the old #root viewport (640x384). */
export const VIEW_WIDTH = 640
export const VIEW_HEIGHT = 384

/**
 * Pixi bootstrap. Owns the Application and the scene graph layout:
 *
 *   stage
 *   ├── world    (camera-scrolled: map / collision grid / non-player content)
 *   ├── ui       (viewport space: the player, NPCs, future HUD)
 *   └── overlay  (full-screen: fade transition, loading screen)
 *
 * The player lives in viewport space (not inside `world`) so the legacy camera
 * logic — which shifts the player AND the background together — ports 1:1.
 */
export class PixiApp {
  readonly app: Application
  readonly world: Container
  readonly ui: Container
  readonly overlay: Container

  constructor() {
    this.app = new Application()
    this.world = new Container()
    this.ui = new Container()
    this.overlay = new Container()
  }

  async init(mount: HTMLElement, scale = 2): Promise<this> {
    await this.app.init({
      width: VIEW_WIDTH,
      height: VIEW_HEIGHT,
      background: 0x1b1b1b,
      antialias: false,
      roundPixels: true,
      sharedTicker: true // so AnimatedSprite auto-update shares the game clock
    })

    const canvas = this.app.canvas
    canvas.style.width = `${VIEW_WIDTH * scale}px`
    canvas.style.height = `${VIEW_HEIGHT * scale}px`
    mount.appendChild(canvas)

    this.app.stage.addChild(this.world, this.ui, this.overlay)
    return this
  }

  /** Drive a per-tick callback from Pixi's ticker (the single game clock). */
  onTick(cb: () => void): void {
    this.app.ticker.add(cb)
  }
}
