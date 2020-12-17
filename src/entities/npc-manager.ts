import { NPC, Sprite, Task } from '../helpers'
import { npcData } from '../data'
import { Observer } from './'
import { Movements, Position } from '../interfaces'

export class NPCManager extends Observer {
  private _currentLevel: string
  private _npcs: NPC[]
  private npcData: any
  private _acceptedTasks: Set<string>
  constructor(
    currentLevel: string
  ) {
    super()
    this._currentLevel = currentLevel
    this._npcs = null
    this.npcData = npcData[currentLevel]
    this._acceptedTasks = new Set(['npc-movement', 'scene-transition-start'])
  }
  handleUpdate({name, action}: Task): void {
    if (!this._acceptedTasks.has(name)) return
    switch (name) {
      case 'npc-movement':
        this.handleMovement(action as keyof Movements)
    }
  }
  handleMovement(direction: keyof Movements) {
    this._npcs.forEach(npc => npc.handleMovement(direction))
  }
  async init(): Promise<Array<HTMLElement>> {
    const npcs = []
    const npcElements = []
    for (const npcKey in this.npcData) {
      const { path, startingPosition } = this.npcData[npcKey]
      const npc = new NPC(npcKey, path)
      npcs.push(npc)
      npcElements.push(await npc.init(startingPosition))
    }
    this._npcs = npcs
    return npcElements
  }
}
