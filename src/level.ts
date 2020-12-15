import levels from './data'
import { Position, SceneTransition, Tile } from './interfaces'

export default class Level {
  public root: HTMLElement
  public name: string
  public grid: any
  constructor(name: string, root: HTMLElement, isDebugMode: boolean = false) {
    this.root = root
    this.name = name
    this.grid = levels[name].default
    if(isDebugMode) {
      this.triggerDebugView()
    }
  }
  getTile(x: number, y:number): Tile {
    return this.grid[`${x}/${y}`]
  }
  getSceneTransition(x: number, y:number): SceneTransition {
    return this.getTile(x, y).sceneTransition
  }
  isSpaceWalkable(x: number, y: number): boolean {
    if(!this.getTile(x, y)) return false
    return this.getTile(x, y).isWalkable
  }
  isSceneTransition(x: number, y: number): boolean {
    if (!this.getTile(x, y)) return false
    return !!this.getTile(x, y).sceneTransition
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
  init(): Position {
    const { path, playerSpawnPoint, backgroundSpawnPoint} = this.grid
    this.root.style.backgroundImage = `url('${path}')`
    this.root.style.backgroundPosition = `${backgroundSpawnPoint[0]}px ${backgroundSpawnPoint[1]}px`
    return playerSpawnPoint
  }
}
