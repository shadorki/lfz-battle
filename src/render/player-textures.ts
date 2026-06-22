import { Assets, Rectangle, Texture } from 'pixi.js'
import { Direction, TILE_WIDTH, TILE_HEIGHT } from './views'
import { PLAYER_SHEET_URL } from './assets'

/**
 * Sliced frames from player.png (128x384 = 4 cols x 6 rows of 32x64).
 * Legacy layout (see old Player.createAnimations): column = direction,
 * rows 0/1/2 = idle / step / step. Walk cycle is [row1, row2, row0] so it
 * ends on the idle pose (row0). Rows 3-5 are unused by the original.
 */
export interface PlayerTextures {
  /** Per direction: [stepA, stepB, idle] — idle is the last frame. */
  walk: Record<Direction, Texture[]>
}

/** Idle pose is the final frame of each walk cycle. */
export const IDLE_FRAME = 2

const DIRECTION_COLUMN: Record<Direction, number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 3
}

export async function loadPlayerTextures(): Promise<PlayerTextures> {
  const base = await Assets.load<Texture>(PLAYER_SHEET_URL)
  base.source.scaleMode = 'nearest' // crisp pixel scaling

  const frame = (col: number, row: number): Texture =>
    new Texture({
      source: base.source,
      frame: new Rectangle(col * TILE_WIDTH, row * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT)
    })

  const walk = {} as Record<Direction, Texture[]>
  for (const dir of ['down', 'up', 'left', 'right'] as Direction[]) {
    const col = DIRECTION_COLUMN[dir]
    walk[dir] = [frame(col, 1), frame(col, 2), frame(col, 0)]
  }

  return { walk }
}
