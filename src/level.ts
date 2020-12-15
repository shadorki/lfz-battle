import levels from './data'
import { Position } from './interfaces'

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
  isSpaceWalkable(x: number, y: number): boolean {
    if(!this.grid[`${x}/${y}`]) return false
    return !this.grid[`${x}/${y}`].isWalkable
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
