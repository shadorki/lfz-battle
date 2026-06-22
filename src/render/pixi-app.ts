import { Application, Container, Graphics, Text } from 'pixi.js'

/** Logical game resolution — matches the old #root viewport (640x384). */
export const VIEW_WIDTH = 640
export const VIEW_HEIGHT = 384

/** Recursively set Text resolution so glyphs rasterize crisp at the on-screen scale. */
function setTextResolution(node: Container, resolution: number): void {
  if (node instanceof Text && node.resolution !== resolution) node.resolution = resolution
  for (const child of node.children) setTextResolution(child as Container, resolution)
}

/**
 * Pixi bootstrap. The renderer fills the window at device pixel density; all
 * game content lives in a `scene` container scaled to fit and centered (the old
 * CSS `transform: scale()` behavior). Scene layout:
 *
 *   stage
 *   └── scene (scaled to window)
 *       ├── world    (camera-scrolled: map / collision grid / non-player content)
 *       ├── ui       (viewport space: player, NPCs, dialogue, HUD)
 *       └── overlay  (full-screen: battle, fade transition, loading/title)
 *
 * Sprites use nearest scaleMode so they stay crisp when the scene scales; Text
 * resolution is bumped to the on-screen scale so it stays crisp too (not blurry).
 * The scene is masked to the 640x384 frame (the old `overflow: hidden`) so the
 * off-frame map and the off-screen (hidden) UI boxes don't bleed into the
 * letterbox area.
 */
export class PixiApp {
  readonly app: Application
  readonly scene: Container
  readonly world: Container
  readonly ui: Container
  readonly overlay: Container
  private readonly _mask: Graphics

  constructor() {
    this.app = new Application()
    this.scene = new Container()
    this.world = new Container()
    this.ui = new Container()
    this.overlay = new Container()
    this._mask = new Graphics().rect(0, 0, VIEW_WIDTH, VIEW_HEIGHT).fill(0xffffff)
  }

  async init(mount: HTMLElement): Promise<this> {
    await this.app.init({
      resizeTo: window,
      background: 0x1b1b1b,
      antialias: false,
      roundPixels: true,
      sharedTicker: true, // so AnimatedSprite auto-update shares the game clock
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    })

    mount.appendChild(this.app.canvas)
    this.scene.addChild(this.world, this.ui, this.overlay)
    this.app.stage.addChild(this.scene, this._mask)
    this.scene.mask = this._mask // clip to the 640x384 frame

    this.fit()
    window.addEventListener('resize', () => this.fit())
    return this
  }

  /** Scale + center the scene to fit the window, and keep text crisp at that scale. */
  fit(): void {
    const sw = this.app.screen.width
    const sh = this.app.screen.height
    const scale = Math.min(sw / VIEW_WIDTH, sh / VIEW_HEIGHT)
    const x = (sw - VIEW_WIDTH * scale) / 2
    const y = (sh - VIEW_HEIGHT * scale) / 2
    // Keep the clip mask locked to the scene's transform.
    this.scene.scale.set(scale)
    this.scene.position.set(x, y)
    this._mask.scale.set(scale)
    this._mask.position.set(x, y)
    const resolution = Math.max(1, Math.ceil(scale * (window.devicePixelRatio || 1)))
    setTextResolution(this.scene, resolution)
  }

  /** Drive a per-tick callback from Pixi's ticker (the single game clock). */
  onTick(cb: (deltaMS: number) => void): void {
    this.app.ticker.add(ticker => cb(ticker.deltaMS))
  }
}
