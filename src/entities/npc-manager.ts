import { Observer } from './'
import { Task } from '../helpers'
import { npcData } from '../data'
import { Direction, NpcPlacement, NpcView } from '../render/views'

/** NPC turns to face the player on interaction (opposite of the player's facing). */
const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
}

/**
 * Builds the NPC set for the current level and rebuilds it on scene change.
 * Rendering lives behind NpcView; the data (npc.json) drives placement.
 */
export class NPCManager extends Observer {
  private _view: NpcView
  private _currentLevel: string
  private _resolveUrl: (path: string) => string
  constructor(
    view: NpcView,
    currentLevel: string,
    resolveUrl: (path: string) => string
  ) {
    super()
    this._view = view
    this._currentLevel = currentLevel
    this._resolveUrl = resolveUrl
    this._acceptedTasks = new Set(['scene-transition-start', 'npc-interaction-start'])
  }
  handleUpdate({ name, action }: Task): void {
    switch (name) {
      case 'scene-transition-start':
        this.handleSceneTransitionStart(action)
      break
      case 'npc-interaction-start':
        this.handleNPCInteractionStart(action)
      break
    }
  }
  /** Render the starting level's NPCs. */
  init(): void {
    this.buildLevel(this._currentLevel)
  }
  private handleSceneTransitionStart({ level }: any): void {
    this._currentLevel = level
    this.buildLevel(level)
  }
  private handleNPCInteractionStart({ name, playerFacingPosition }: any): void {
    this._view.faceNpc(name, OPPOSITE[playerFacingPosition as Direction])
  }
  private buildLevel(level: string): void {
    const data = npcData[level] || []
    const placements: NpcPlacement[] = data.map((d: any) => ({
      name: d.name,
      sheetUrl: this._resolveUrl(d.path),
      gridX: d.startingPosition.x,
      gridY: d.startingPosition.y,
      facing: d.facingPosition
    }))
    this._view.setNpcs(placements)
  }
}
