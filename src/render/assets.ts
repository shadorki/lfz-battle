/**
 * Asset URL registry. Importing an image through Vite returns its served/hashed
 * URL, so paths live in one place. Assets currently sit under `docs/assets`
 * (legacy build dir); a later milestone can relocate them without touching
 * call sites.
 */
import playerSheetUrl from '../../docs/assets/images/players/player.png'

export const PLAYER_SHEET_URL = playerSheetUrl

/**
 * All map background art, bundled via Vite glob and keyed by filename. The level
 * data references maps by path (e.g. './assets/images/maps/home.png'); we match
 * on the basename so no per-map import is needed.
 */
const mapModules = import.meta.glob('../../docs/assets/images/maps/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>

const MAP_BY_FILE: Record<string, string> = {}
for (const fullPath in mapModules) {
  const file = fullPath.split('/').pop() as string
  MAP_BY_FILE[file] = mapModules[fullPath]
}

/** Resolve a bundled map URL from a level's data `path` (matches on basename). */
export function mapUrlForPath(jsonPath: string): string {
  const file = jsonPath.split('/').pop() as string
  const url = MAP_BY_FILE[file]
  if (!url) throw new Error(`No bundled map found for "${jsonPath}" (file: ${file})`)
  return url
}

/** All character/NPC spritesheets (the players/ dir), keyed by filename. */
const spriteModules = import.meta.glob('../../docs/assets/images/players/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>

const SPRITE_BY_FILE: Record<string, string> = {}
for (const fullPath in spriteModules) {
  const file = fullPath.split('/').pop() as string
  SPRITE_BY_FILE[file] = spriteModules[fullPath]
}

/** Resolve a bundled sprite URL from a data `path` (matches on basename). */
export function spriteUrlForPath(jsonPath: string): string {
  const file = jsonPath.split('/').pop() as string
  const url = SPRITE_BY_FILE[file]
  if (!url) throw new Error(`No bundled sprite found for "${jsonPath}" (file: ${file})`)
  return url
}
