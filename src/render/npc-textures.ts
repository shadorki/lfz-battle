import { Assets, Rectangle, Texture } from 'pixi.js'
import { Direction, TILE_WIDTH, TILE_HEIGHT } from './views'

/**
 * NPC spritesheets are 128x64 = 4 cols x 1 row of 32x64 frames, one per facing
 * direction (legacy NPC.setFacingPositions: down=0, up=1, left=2, right=3).
 * No walk frames.
 */
const DIRECTION_COLUMN: Record<Direction, number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 3
}

export async function loadNpcTextures(url: string): Promise<Record<Direction, Texture>> {
  const base = await Assets.load<Texture>(url)
  base.source.scaleMode = 'nearest'

  const out = {} as Record<Direction, Texture>
  for (const dir of ['down', 'up', 'left', 'right'] as Direction[]) {
    out[dir] = new Texture({
      source: base.source,
      frame: new Rectangle(DIRECTION_COLUMN[dir] * TILE_WIDTH, 0, TILE_WIDTH, TILE_HEIGHT)
    })
  }
  return out
}
