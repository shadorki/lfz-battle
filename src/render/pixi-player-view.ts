import { AnimatedSprite } from 'pixi.js'
import { PlayerView, Direction, easeToward } from './views'
import { PlayerTextures, IDLE_FRAME } from './player-textures'

/** Per-frame walk duration (ms), matching the legacy Animator (50ms/frame). */
const FRAME_MS = 50
/**
 * Vertical render offset of the sprite relative to its logical tile box.
 * The legacy renderer drew the sprite shifted up 24px to seat the character on
 * the map art; this reproduces that without affecting logical/tween position.
 */
const RENDER_OFFSET_X = 0
const RENDER_OFFSET_Y = -24

/**
 * Real player sprite. One AnimatedSprite whose textures swap per facing
 * direction; a movement plays the 3-frame stride once and lands on idle.
 * Logical position lives in Player; `_eased` follows it each tick, and the
 * sprite is drawn at `_eased + render offset`.
 */
export class PixiPlayerView implements PlayerView {
  readonly root: AnimatedSprite
  private readonly _walk: PlayerTextures['walk']
  private readonly _target = { x: 0, y: 0 }
  private readonly _eased = { x: 0, y: 0 }
  private _placed = false

  constructor(textures: PlayerTextures) {
    this._walk = textures.walk
    this.root = new AnimatedSprite(textures.walk.down)
    this.root.animationSpeed = (1000 / 60) / FRAME_MS // ~0.33: advance one frame per 50ms at 60fps
    this.root.loop = false
    this.root.gotoAndStop(IDLE_FRAME)
  }

  setPosition(left: number, top: number, immediate = false): void {
    this._target.x = left
    this._target.y = top
    if (immediate || !this._placed) {
      this._eased.x = left
      this._eased.y = top
      this.draw() // snap (first placement, spawn, or scene transition)
      this._placed = true
    }
  }

  setFacing(direction: Direction): void {
    this.root.textures = this._walk[direction]
    this.root.gotoAndStop(IDLE_FRAME)
  }

  playAnimation(direction: Direction): void {
    this.root.textures = this._walk[direction]
    this.root.loop = false
    this.root.gotoAndPlay(0)
  }

  /** Ease the rendered position toward the logical target. Called each tick. */
  update(): void {
    this._eased.x = easeToward(this._eased.x, this._target.x)
    this._eased.y = easeToward(this._eased.y, this._target.y)
    this.draw()
  }

  private draw(): void {
    this.root.position.set(this._eased.x + RENDER_OFFSET_X, this._eased.y + RENDER_OFFSET_Y)
  }
}
