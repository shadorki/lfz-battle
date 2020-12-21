import { UI } from ".";

export class EnemyUI extends UI {
  private _writingIntervalId: number
  private _content: HTMLElement
  constructor(isPlayer: boolean) {
    super(isPlayer)
    this._writingIntervalId = null
    this._content = this._uiContainer.querySelector('.content')
  }
  async writeText(text: string): Promise<void> {
    const message = text.split('')
    return new Promise(resolve => {
      this.content = ''
      this._writingIntervalId = window.setInterval(() => {
        if (!message.length) {
          clearInterval(this._writingIntervalId)
          return resolve()
        }
        const letter = message.shift()
        this.content = this.content + letter
      }, 50)
    })
  }
  get content(): string {
    return this._content.textContent
  }
  set content(text: string) {
    this._content.textContent = text
  }
  reset(): void {
    this.content = ''
  }
}
