import { Container } from 'pixi.js'
import { CameraView, MOVE_DURATION_MS, lerp } from './views'

/**
 * Scrolls the `world` container. Replaces mutating the root element's
 * `background-position`. Uses the same constant-speed glide as the player
 * (MOVE_DURATION_MS) so the background scrolls in lockstep with player movement.
 */
export class PixiCameraView implements CameraView {
  private readonly _from = { x: 0, y: 0 }
  private readonly _to = { x: 0, y: 0 }
  private readonly _pos = { x: 0, y: 0 }
  private _elapsed = MOVE_DURATION_MS
  private _placed = false

  constructor(private readonly world: Container) {}

  setScroll(x: number, y: number, immediate = false): void {
    if (immediate || !this._placed) {
      this._from.x = this._to.x = this._pos.x = x
      this._from.y = this._to.y = this._pos.y = y
      this._elapsed = MOVE_DURATION_MS
      this._placed = true
      this.world.position.set(x, y)
      return
    }
    this._from.x = this._pos.x
    this._from.y = this._pos.y
    this._to.x = x
    this._to.y = y
    this._elapsed = 0
  }

  /** Advance the constant-speed scroll toward the target. Called each tick. */
  update(deltaMS: number): void {
    if (this._elapsed >= MOVE_DURATION_MS) return
    this._elapsed = Math.min(this._elapsed + deltaMS, MOVE_DURATION_MS)
    const t = this._elapsed / MOVE_DURATION_MS
    this._pos.x = lerp(this._from.x, this._to.x, t)
    this._pos.y = lerp(this._from.y, this._to.y, t)
    this.world.position.set(this._pos.x, this._pos.y)
  }
}
