export class Sprite {
  private _name: string
  private _path: string
  private _grid: Array<number>
  public sheet: Array<Array<number>>
  public width: number
  public height: number
  constructor(name: string, path: string, grid: Array<number>) {
    this._name = name
    this._path = path
    this._grid = grid
    this.sheet = null
    this.width = null
    this.height = null
  }
  async loadImageData(): Promise<Array<number>> {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.src = this._path
      image.onload = () => resolve([image.width, image.width])
      image.onerror = reject
    })
  }
  async init(): Promise<void> {
    const [imageWidth, imageHeight] = await this.loadImageData()
    const [columns, rows] = this._grid
    const sheet = []
    this.width = imageWidth / columns
    this.height = imageHeight / rows
    for(let rowCounter = 0; rowCounter < imageHeight; rowCounter+=this.width) {
      for(let columnCounter = 0; columnCounter < imageWidth; columnCounter+=this.height) {
        sheet.push([rowCounter, columnCounter])
      }
    }
    this.sheet = sheet
  }
}
