import { NPC, Sprite, Task } from '../helpers'
import { npcData } from '../data'
import { Observer } from './'
import { Movements, NPCList, Position, SceneTransition } from '../interfaces'

export class NPCManager extends Observer {
  private _currentLevel: string
  private _root: HTMLElement
  private _npcs: NPCList
  private npcData: any
  private _acceptedTasks: Set<string>
  constructor(
    currentLevel: string,
    root: HTMLElement
  ) {
    super()
    this._root = root
    this._currentLevel = currentLevel
    this._npcs = {}
    this.npcData = npcData[currentLevel]
    this._acceptedTasks = new Set(['npc-movement', 'npc-interaction-start', 'scene-transition-start'])
  }
  get npcs(): NPC[] {
    return this._npcs[this._currentLevel]
  }
  set npcs(npcs: NPC[]) {
    this._npcs[this._currentLevel] = npcs
  }
  handleUpdate({name, action}: Task): void {
    if (!this._acceptedTasks.has(name)) return
    switch (name) {
      case 'npc-movement':
        this.handleNPCMovement(action as keyof Movements)
      break
      case 'npc-interaction-start':
        this.handleNPCInteractionStart(action)
      break
      case 'scene-transition-start':
        this.handleSceneTransitionStart(action)
      break
    }
  }
  resetGym(): void {
    [
      'gymEntrance',
      'gymArena1PreBattle',
      'gymArena2PreBattle',
      'gymArena3PreBattle',
      'gymArena4PreBattle',
      'gymArena5PreBattle',
      'gymArena1PostBattle',
      'gymArena2PostBattle',
      'gymArena3PostBattle',
      'gymArena4PostBattle',
      'gymArena5PostBattle',
      'gymArena6'
    ].forEach(l => delete this._npcs[l])
  }
  handleNPCInteractionStart(action: any): void {
    const { name, playerFacingPosition } = action
    const npc = this.npcs.find(npc => npc.name === name)
    npc.faceTowardsPlayer(playerFacingPosition)
  }
  handleNPCMovement(direction: keyof Movements): void {
    this.npcs.forEach(npc => npc.handleMovement(direction))
  }
  async handleSceneTransitionStart({ level }: SceneTransition): Promise<void> {
    this.npcs.forEach(npc => npc.ejectFromDom())
    this.switchLevel(level)
    let npcElements = null
    if(!this.npcs) {
      npcElements = await this.init()
    } else {
      npcElements = this.npcs.map(npc => npc.domElement)
    }
    this._root.append(...npcElements)
    if (level === 'home') this.resetGym()

  }
  switchLevel(newLevel: string) {
    this.npcData = npcData[newLevel]
    this._currentLevel = newLevel
  }
  async init(): Promise<Array<HTMLElement>> {
    const npcs: NPC[] = []
    const npcElements = []
    for(let i = 0; i < this.npcData.length; i++) {
      const { path, startingPosition, facingPosition, positionOnDOM, name } = this.npcData[i]
      const npcData: NPC = new NPC(name, path, facingPosition)
      const element = await npcData.init(startingPosition, positionOnDOM)
      npcs.push(npcData)
      npcElements.push(element)
    }
    this.npcs = npcs
    return npcElements
  }
}
