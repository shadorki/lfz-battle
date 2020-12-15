export class Sprite {
  public name: string
  public path: string
  public grid: number[]
  public sheet: number[][]
  public width: number
  public height: number
  constructor(name: string, path: string, grid: number[]) {
    this.name = name
    this.path = path
    this.grid = grid
    this.sheet = null
    this.width = null
    this.height = null
  }
  async loadImageData(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.src = this.path
      image.onload = () => resolve([image.width, image.height])
      image.onerror = reject
    })
  }
  async init(): Promise<void> {
    const [imageWidth, imageHeight] = await this.loadImageData()
    const [columns, rows] = this.grid
    const sheet = []
    this.width = imageWidth / columns
    this.height = imageHeight / rows
    for(let x = 0; x < columns; x++) {
      for (let i = 0; i < rows; i++) {
        sheet.push([-(x * this.width), -(i * this.height)])
      }
    }
    this.sheet = sheet
  }
}
