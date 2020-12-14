import Level1 from './data/level-1.json'

export default class Level {
  public root: HTMLElement
  public name: string
  public grid: any
  constructor(name: string, root: HTMLElement) {
    this.root = root
    this.name = name
    this.grid = Level1
  }
  isSpaceWalkable(x: number, y: number) {
    if(!this.grid[`${x}/${y}`]) return false
    return !this.grid[`${x}/${y}`].isWalkable
  }
}
