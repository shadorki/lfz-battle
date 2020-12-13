export class Sprite {
  public name: string
  public path: string
  public grid: Array<number>
  public sheet: Array<Array<number>>
  public width: number
  public height: number
  constructor(name: string, path: string, grid: Array<number>) {
    this.name = name
    this.path = path
    this.grid = grid
    this.sheet = null
    this.width = null
    this.height = null
  }
  async loadImageData(): Promise<Array<number>> {
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
    for(let rowCounter = 0; rowCounter < imageHeight; rowCounter+=this.width) {
      for(let columnCounter = 0; columnCounter < imageWidth; columnCounter+=this.height) {
        sheet.push([-rowCounter, -columnCounter])
      }
    }
    console.log(sheet)
    this.sheet = sheet
  }
}
