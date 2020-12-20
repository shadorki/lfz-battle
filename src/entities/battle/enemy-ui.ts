import { UI } from ".";

export class EnemyUI extends UI {
  private _message: string
  private _writingIntervalId: number
  private _currentWritingText: string[]
  private _content: HTMLElement
  constructor(isPlayer: boolean) {
    super(isPlayer)
    this._message = null
    this._currentWritingText = null
    this._writingIntervalId = null
    this._content = this._uiContainer.querySelector('.content')
  }
  setMessage(text: string) {
    this._message = text
    this._currentWritingText = text.split('')
  }
  writeText(onTextComplete: Function, delayToCB: number): void {
    this.content = ''
    this._writingIntervalId = window.setInterval(() => {
      if (!this._currentWritingText.length) {
        clearInterval(this._writingIntervalId)
        setTimeout(onTextComplete, delayToCB)
        return
      }
      const letter = this._currentWritingText.shift()
      this.content = this.content + letter
    }, 50)
  }
  get content(): string {
    return this._content.textContent
  }
  set content(text: string) {
    this._content.textContent = text
  }
}
