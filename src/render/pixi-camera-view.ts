import { Container } from 'pixi.js'
import { CameraView, easeToward } from './views'

/**
 * Scrolls the `world` container. Replaces mutating the root element's
 * `background-position`. Camera state (numeric) stays in Camera; this view
 * eases the rendered scroll toward it each tick so the background glides with
 * the player (the old #root had `transition: 500ms` too).
 */
export class PixiCameraView implements CameraView {
  private readonly _target = { x: 0, y: 0 }
  private _placed = false

  constructor(private readonly world: Container) {}

  setScroll(x: number, y: number, immediate = false): void {
    this._target.x = x
    this._target.y = y
    if (immediate || !this._placed) {
      this.world.position.set(x, y) // snap (first placement or scene transition)
      this._placed = true
    }
  }

  /** Ease the rendered scroll toward the target. Called each tick. */
  update(): void {
    const pos = this.world.position
    pos.x = easeToward(pos.x, this._target.x)
    pos.y = easeToward(pos.y, this._target.y)
  }
}
