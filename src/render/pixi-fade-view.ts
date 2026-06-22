import { Graphics } from 'pixi.js'
import { FadeView, easeToward } from './views'
import { VIEW_WIDTH, VIEW_HEIGHT } from './pixi-app'

/** Alpha snap threshold — fine, since alpha is 0..1 (not pixels). */
const ALPHA_EPSILON = 0.01

/**
 * Full-screen black overlay whose alpha eases toward a target. Replaces the old
 * #transition DOM div + CSS opacity transition. Lives in the top overlay layer.
 */
export class PixiFadeView implements FadeView {
  readonly root: Graphics
  private _target = 0

  constructor() {
    this.root = new Graphics().rect(0, 0, VIEW_WIDTH, VIEW_HEIGHT).fill(0x000000)
    this.root.alpha = 0
  }

  show(): void {
    this._target = 1
  }

  hide(): void {
    this._target = 0
  }

  update(): void {
    this.root.alpha = easeToward(this.root.alpha, this._target, ALPHA_EPSILON)
  }
}
