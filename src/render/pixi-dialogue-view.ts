import { Container, Graphics, Text } from 'pixi.js'
import { DialogueView, easeToward } from './views'
import { VIEW_WIDTH, VIEW_HEIGHT } from './pixi-app'
import { FONT_FIRE_RED } from './assets'

const BOX_WIDTH = 560
const BOX_HEIGHT = 110
const BOX_X = (VIEW_WIDTH - BOX_WIDTH) / 2
const SHOWN_Y = VIEW_HEIGHT - BOX_HEIGHT - 16
const HIDDEN_Y = VIEW_HEIGHT + 8 // off the bottom edge
const ALPHA_EPSILON = 0.01

/**
 * Pixi dialogue box (lives in the `ui` layer above the player). Replaces the
 * legacy DOM dialogue div + CSS slide. The Dialogue entity owns the text/
 * typewriter logic and pushes strings in via setHeading/setContent.
 */
export class PixiDialogueView implements DialogueView {
  readonly root: Container
  private readonly _heading: Text
  private readonly _content: Text
  private _targetAlpha = 0
  private _targetY = HIDDEN_Y

  constructor() {
    this.root = new Container()
    this.root.position.set(BOX_X, HIDDEN_Y)
    this.root.alpha = 0

    const bg = new Graphics()
      .roundRect(0, 0, BOX_WIDTH, BOX_HEIGHT, 8)
      .fill(0xf5f5dc) // beige
      .stroke({ width: 5, color: 0xbc8f8f }) // rosybrown

    const heading = new Text({
      text: '',
      style: { fontFamily: FONT_FIRE_RED, fontSize: 18, fill: 0x000000 }
    })
    heading.position.set(12, 8)

    const rule = new Graphics().rect(8, 32, BOX_WIDTH - 16, 2).fill(0x000000)

    const content = new Text({
      text: '',
      style: {
        fontFamily: FONT_FIRE_RED,
        fontSize: 16,
        fill: 0x000000,
        wordWrap: true,
        wordWrapWidth: BOX_WIDTH - 24
      }
    })
    content.position.set(12, 38)

    this.root.addChild(bg, heading, rule, content)
    this._heading = heading
    this._content = content
  }

  setHeading(text: string): void {
    this._heading.text = text
  }

  setContent(text: string): void {
    this._content.text = text
  }

  show(): void {
    this._targetAlpha = 1
    this._targetY = SHOWN_Y
  }

  hide(): void {
    this._targetAlpha = 0
    this._targetY = HIDDEN_Y
  }

  /** Ease the slide + fade. Called each tick. */
  update(): void {
    this.root.alpha = easeToward(this.root.alpha, this._targetAlpha, ALPHA_EPSILON)
    this.root.y = easeToward(this.root.y, this._targetY)
  }
}
