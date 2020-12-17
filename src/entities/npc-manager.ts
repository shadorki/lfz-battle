import { NPC, Sprite, Task } from '../helpers'
import { npcData } from '../data'
import { Observer } from './'
import { Movements, Position } from '../interfaces'

export class NPCManager extends Observer {
  private _currentLevel: string
  private _npcs: NPC[]
  private npcData: any
  constructor(
    currentLevel: string
  ) {
    super()
    this._currentLevel = currentLevel
    this._npcs = null
    this.npcData = npcData[currentLevel]
  }
  handleUpdate(task: Task): void {}

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
