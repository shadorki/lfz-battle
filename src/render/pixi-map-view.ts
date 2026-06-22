import { Assets, Container, Graphics, Sprite, Texture } from 'pixi.js'
import { MapView, TILE_WIDTH, TILE_HEIGHT } from './views'
import { Tile } from '../interfaces'

/**
 * Map background art. The map and the collision grid share origin and scale
 * (tile (x,y) -> pixel (x*TILE_WIDTH, y*TILE_HEIGHT)), so the sprite sits at the
 * world origin and the existing camera scroll lines everything up.
 */
export async function loadMapTexture(url: string): Promise<Texture> {
  const tex = await Assets.load<Texture>(url)
  tex.source.scaleMode = 'nearest' // crisp pixel scaling
  return tex
}

/** Holds the map background sprite and swaps its texture on scene change. */
export class PixiMapView implements MapView {
  readonly root: Sprite

  constructor(initialTexture: Texture) {
    this.root = new Sprite(initialTexture)
    this.root.position.set(0, 0)
  }

  setMap(url: string): void {
    // Fire-and-forget: the swap completes during the transition fade (Pixi
    // caches by URL, so revisited maps are instant).
    loadMapTexture(url).then(tex => { this.root.texture = tex })
  }
}

/**
 * Debug overlay: blocked tiles translucent red, walkable tiles a faint outline.
 * Drawn over the map to verify collision-grid alignment with the art.
 */
export function drawCollisionOverlay(grid: Record<string, Tile>): Container {
  const container = new Container()
  const g = new Graphics()

  for (const key in grid) {
    if (!/^\d+\/\d+$/.test(key)) continue // skip non-tile fields (path, spawn points)
    const tile = grid[key]
    const x = tile.x * TILE_WIDTH
    const y = tile.y * TILE_HEIGHT
    if (tile.isWalkable) {
      g.rect(x, y, TILE_WIDTH, TILE_HEIGHT).stroke({ width: 1, color: 0x00ff00, alpha: 0.25 })
    } else {
      g.rect(x, y, TILE_WIDTH, TILE_HEIGHT).fill({ color: 0xff0000, alpha: 0.3 })
    }
  }

  container.addChild(g)
  return container
}
