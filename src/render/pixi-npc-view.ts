import { Container, Sprite, Texture } from 'pixi.js'
import { NpcView, NpcPlacement, Direction, TILE_WIDTH, TILE_HEIGHT } from './views'
import { loadNpcTextures } from './npc-textures'

/** Same vertical seat offset as the player sprite (legacy -24). */
const RENDER_OFFSET_Y = -24

interface NpcEntry {
  sprite: Sprite
  textures: Record<Direction, Texture> | null
}

/**
 * Renders NPCs as sprites inside the `world` container at map-pixel position
 * (grid * tile), so they scroll with the map automatically — no per-NPC camera
 * shift needed (unlike the legacy DOM approach).
 */
export class PixiNpcView implements NpcView {
  readonly root: Container
  private readonly _entries = new Map<string, NpcEntry>()

  constructor() {
    this.root = new Container()
  }

  setNpcs(placements: NpcPlacement[]): void {
    this.root.removeChildren()
    this._entries.clear()

    for (const p of placements) {
      const sprite = new Sprite()
      sprite.position.set(p.gridX * TILE_WIDTH, p.gridY * TILE_HEIGHT + RENDER_OFFSET_Y)
      this.root.addChild(sprite)

      const entry: NpcEntry = { sprite, textures: null }
      this._entries.set(p.name, entry)

      loadNpcTextures(p.sheetUrl).then(textures => {
        entry.textures = textures
        sprite.texture = textures[p.facing]
      })
    }
  }

  faceNpc(name: string, direction: Direction): void {
    const entry = this._entries.get(name)
    if (entry && entry.textures) entry.sprite.texture = entry.textures[direction]
  }
}
