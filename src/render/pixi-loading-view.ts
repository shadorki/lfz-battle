import { Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js'
import { LoadingView } from './views'
import { VIEW_WIDTH, VIEW_HEIGHT } from './pixi-app'
import { LOADING_SCREEN_URL, FONT_PRESS_START } from './assets'

/**
 * Full-screen title/boot overlay: the loading-screen art with a centered status
 * message. Replaces the legacy #loading-screen DOM div. Topmost overlay child so
 * it gates the game until the player presses space.
 */
export class PixiLoadingView implements LoadingView {
  readonly root: Container
  private readonly _title: Sprite
  private readonly _message: Text

  constructor() {
    this.root = new Container()
    const bg = new Graphics().rect(0, 0, VIEW_WIDTH, VIEW_HEIGHT).fill(0x000000)

    this._title = new Sprite()
    Assets.load<Texture>(LOADING_SCREEN_URL).then(tex => {
      tex.source.scaleMode = 'nearest'
      this._title.texture = tex
      // Fit (contain) within the view, centered.
      const scale = Math.min(VIEW_WIDTH / tex.width, VIEW_HEIGHT / tex.height)
      this._title.scale.set(scale)
      this._title.position.set(
        (VIEW_WIDTH - tex.width * scale) / 2,
        (VIEW_HEIGHT - tex.height * scale) / 2
      )
    })

    this._message = new Text({
      text: 'Loading...',
      style: { fontFamily: FONT_PRESS_START, fontSize: 9, fill: 0xffffff, align: 'center' }
    })
    this._message.anchor.set(0.5)
    this._message.position.set(VIEW_WIDTH / 2, VIEW_HEIGHT - 65)

    this.root.addChild(bg, this._title, this._message)
  }

  setMessage(text: string): void {
    this._message.text = text
  }

  show(): void {
    this.root.visible = true
  }

  hide(): void {
    this.root.visible = false
  }
}
