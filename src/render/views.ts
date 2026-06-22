/**
 * Renderer-agnostic view seam.
 *
 * Game logic (Player, Camera) talks to these interfaces instead of the DOM.
 * A DOM implementation could mirror the old behavior; the Pixi implementations
 * live alongside this file. Swapping the rendering layer = swapping the view.
 */

export type Direction = 'up' | 'down' | 'left' | 'right'

/** One tile = one player frame in screen pixels (top-down 32x64, matching the legacy grid). */
export const TILE_WIDTH = 32
export const TILE_HEIGHT = 64

/** Per-tick position smoothing — replaces the old CSS `transition: 500ms`. */
export const TWEEN_FACTOR = 0.25
/** Snap threshold (px) so eased positions settle exactly on target. */
export const SNAP_EPSILON = 0.5

/** Ease a current value toward a target by TWEEN_FACTOR, snapping when within `epsilon`. */
export function easeToward(current: number, target: number, epsilon: number = SNAP_EPSILON): number {
  const next = current + (target - current) * TWEEN_FACTOR
  return Math.abs(target - next) < epsilon ? target : next
}

export interface PlayerView {
  /**
   * Place the player at a viewport pixel position (top-left origin).
   * `immediate` snaps (no glide) — used for spawn and scene transitions.
   */
  setPosition(left: number, top: number, immediate?: boolean): void
  /** Face a direction while standing still. */
  setFacing(direction: Direction): void
  /** Play the walk animation for a direction (no-op placeholder until sprites land). */
  playAnimation(direction: Direction): void
}

export interface CameraView {
  /**
   * Scroll the world (map + non-player content) by a pixel offset.
   * `immediate` snaps (no glide) — used for init and scene transitions.
   */
  setScroll(x: number, y: number, immediate?: boolean): void
}

export interface MapView {
  /** Swap the rendered map background to the art at `url` (loads + caches). */
  setMap(url: string): void
}

export interface NpcPlacement {
  name: string
  sheetUrl: string
  gridX: number
  gridY: number
  facing: Direction
}

export interface NpcView {
  /** Rebuild the NPC set for the current level (clears previous). */
  setNpcs(placements: NpcPlacement[]): void
  /** Turn a named NPC to face a direction (on interaction). */
  faceNpc(name: string, direction: Direction): void
}

export interface DialogueView {
  /** Set the speaker name shown in the box header. */
  setHeading(text: string): void
  /** Set the body text (typed out letter-by-letter by the Dialogue entity). */
  setContent(text: string): void
  /** Slide the dialogue box in. */
  show(): void
  /** Slide the dialogue box out. */
  hide(): void
}

export interface FadeView {
  /** Fade the screen to black. */
  show(): void
  /** Fade the screen back to clear. */
  hide(): void
  /** Advance the fade easing. Called each tick. */
  update(): void
}
