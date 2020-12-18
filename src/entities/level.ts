import { levels } from '../data'
import { Observer } from '.'
import { Task } from '../helpers'
import { Interaction, Position, SceneTransition, Tile } from '../interfaces'

export class Level extends Observer {
  public _acceptedTasks: Set<string>
  public root: HTMLElement
  public name: string
  public grid: any
  constructor(name: string, root: HTMLElement, isDebugMode: boolean = false) {
    super()
    this._acceptedTasks = new Set(['scene-transition-start'])
    this.root = root
    this.name = name
    this.grid = levels[name].default
    if(isDebugMode) {
      this.triggerDebugView()
    }
  }
  handleUpdate({ name, action}: Task): void {
    if (!this._acceptedTasks.has(name)) return
    switch(name) {
      case 'scene-transition-start':
        this.handleSceneTransitionStart(action)
      break;
    }
  }
  handleSceneTransitionStart(action: any) {
    const {
      level,
    } = action
    this.changeGrid(level)
    const { path } = this.grid
    this.changeMap(path)
  }
  getTile(x: number, y:number): Tile {
    return this.grid[`${x}/${y}`]
  }
  getSceneTransition(x: number, y:number): SceneTransition {
    return this.getTile(x, y).sceneTransition
  }
  getInteraction(x: number, y: number): Interaction {
    return this.getTile(x, y).interaction
  }
  isSpaceWalkable(x: number, y: number): boolean {
    if(!this.getTile(x, y)) return false
    return this.getTile(x, y).isWalkable
  }
  isSceneTransition(x: number, y: number): boolean {
    if (!this.getTile(x, y).sceneTransition) return false
    return !!this.getTile(x, y).sceneTransition
  }
  isInteraction(x: number, y: number): boolean {
    if (!this.getTile(x, y).interaction) return false
    return !!this.getTile(x, y).interaction
  }
  triggerDebugView(): void {
    for(const tile in this.grid) {
      const { x, y, isWalkable} = this.grid[tile]
      const element = document.createElement('div')
      element.className = 'space'
      element.style.top = `${y * 64}px`
      element.style.left = `${x * 32}px`
      element.textContent = `${x}/${y}`
      if(isWalkable) {
        element.style.border = '2px solid green'
      } else {
        element.style.border = '2px solid red'
      }
      this.root.append(element)
    }
    this.root.style.width = '1920px'
    this.root.style.height = '1280px'
  }
  changeMap(path: string): void {
    this.root.style.backgroundImage = `url('${path}')`
  }
  changeGrid(gridName: string): void {
    this.grid = levels[gridName].default
  }
  shiftBackgroundPosition(x: number, y:number) {
    this.root.style.backgroundPosition = `${x}px ${y}px`
  }
  init(): Position {
    const { path, playerSpawnPoint, backgroundSpawnPoint} = this.grid
    const [x, y] = backgroundSpawnPoint
    this.changeMap(path)
    this.shiftBackgroundPosition(x, y)
    return playerSpawnPoint
  }
}
