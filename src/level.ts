import Level1 from './data/level-1.json'

export default class Level {
  public root: HTMLElement
  public name: string
  public grid: any
  constructor(name: string, root: HTMLElement, isDebugMode: boolean = false) {
    this.root = root
    this.name = name
    this.grid = Level1
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
}
