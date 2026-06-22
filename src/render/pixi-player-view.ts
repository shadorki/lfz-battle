import { AnimatedSprite } from 'pixi.js'
import { PlayerView, Direction, MOVE_DURATION_MS, lerp } from './views'
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
 *
 * Position is interpolated at constant speed from the previous tile to the
 * target over MOVE_DURATION_MS (synced to the walk-repeat interval), so holding
 * a direction reads as one continuous glide. Logical position lives in Player.
 */
export class PixiPlayerView implements PlayerView {
  readonly root: AnimatedSprite
  private readonly _walk: PlayerTextures['walk']
  private readonly _from = { x: 0, y: 0 }
  private readonly _to = { x: 0, y: 0 }
  private readonly _pos = { x: 0, y: 0 }
  private _elapsed = MOVE_DURATION_MS
  private _placed = false

  constructor(textures: PlayerTextures) {
    this._walk = textures.walk
    this.root = new AnimatedSprite(textures.walk.down)
    this.root.animationSpeed = (1000 / 60) / FRAME_MS // ~0.33: advance one frame per 50ms at 60fps
    this.root.loop = false
    this.root.gotoAndStop(IDLE_FRAME)
  }

  setPosition(left: number, top: number, immediate = false): void {
    if (immediate || !this._placed) {
      this._from.x = this._to.x = this._pos.x = left
      this._from.y = this._to.y = this._pos.y = top
      this._elapsed = MOVE_DURATION_MS
      this._placed = true
      this.draw()
      return
    }
    // Start a new glide from where we currently are toward the new tile.
    this._from.x = this._pos.x
    this._from.y = this._pos.y
    this._to.x = left
    this._to.y = top
    this._elapsed = 0
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

  /** Advance the constant-speed glide toward the target tile. Called each tick. */
  update(deltaMS: number): void {
    if (this._elapsed >= MOVE_DURATION_MS) return
    this._elapsed = Math.min(this._elapsed + deltaMS, MOVE_DURATION_MS)
    const t = this._elapsed / MOVE_DURATION_MS
    this._pos.x = lerp(this._from.x, this._to.x, t)
    this._pos.y = lerp(this._from.y, this._to.y, t)
    this.draw()
  }

  private draw(): void {
    this.root.position.set(this._pos.x + RENDER_OFFSET_X, this._pos.y + RENDER_OFFSET_Y)
  }
}
