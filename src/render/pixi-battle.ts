import { Assets, Container, Graphics, Rectangle, Sprite, Text, Texture } from 'pixi.js'
import { VIEW_WIDTH, VIEW_HEIGHT } from './pixi-app'
import { mapUrlForPath, spriteUrlForPath } from './assets'

/**
 * Battle questions/answers are code (CSS/HTML/JS) full of symbols (# < > { } / …)
 * that the pixel game-font lacks, so they use monospace — full glyph coverage and
 * the right look for code (the legacy game used sans-serif here for the same reason).
 */
const BATTLE_FONT = 'monospace'

/**
 * Pixi reimplementation of the legacy DOM battle components. Each class keeps
 * the exact method surface the Battle orchestrator (entities/battle/battle.ts)
 * calls — show/hide/set/damage/writeText/etc — so that orchestration is
 * preserved verbatim; only the rendering moved from DOM to Pixi.
 *
 * Transitions are eased per-tick (slides for fighters/UI, fades for backdrop/
 * arena/HP, a draining HP bar) to mirror the legacy CSS transitions. Each
 * component exposes update(); createPixiBattle returns an aggregate updater the
 * game calls every frame.
 */

const ARENA_W = 640
const ARENA_H = 299
const ARENA_Y = Math.floor((VIEW_HEIGHT - ARENA_H) / 2) // 42

const FIGHTER = 128
const UI_W = 350
const UI_H = 100
const HP_W = 20
const HP_H = 100

const SLIDE_FACTOR = 0.18
const FADE_FACTOR = 0.12
const DRAIN_FACTOR = 0.1

function approach(current: number, target: number, factor: number, epsilon: number): number {
  const next = current + (target - current) * factor
  return Math.abs(target - next) < epsilon ? target : next
}

function frameTexture(base: Texture, x: number, y: number, w: number, h: number): Texture {
  return new Texture({ source: base.source, frame: new Rectangle(x, y, w, h) })
}

async function loadSheet(url: string): Promise<Texture> {
  const tex = await Assets.load<Texture>(url)
  tex.source.scaleMode = 'nearest'
  return tex
}

/** Full-screen black behind the arena (fades in/out). */
class BackDrop {
  readonly root: Graphics
  private _targetAlpha = 0
  constructor() {
    this.root = new Graphics().rect(0, 0, VIEW_WIDTH, VIEW_HEIGHT).fill(0x000000)
    this.root.alpha = 0
  }
  show(): void { this._targetAlpha = 1 }
  hide(): void { this._targetAlpha = 0 }
  update(): void { this.root.alpha = approach(this.root.alpha, this._targetAlpha, FADE_FACTOR, 0.01) }
}

/** Battle background art (640x299), keyed by arena type (fades in/out). */
class Arena {
  readonly root: Sprite
  private readonly _frames: Record<string, Texture> = {}
  private _targetAlpha = 0
  // [col, row] in the 3x4 battle-backgrounds sheet (legacy order, index 7 skipped).
  private static readonly MAP: Record<string, [number, number]> = {
    normal: [0, 0], rock: [0, 1], dirt: [0, 2], ghost: [0, 3],
    grass: [1, 0], water: [1, 1], psychic: [1, 2],
    ocean: [2, 0], ice: [2, 1], plant: [2, 2]
  }
  constructor(sheet: Texture) {
    this.root = new Sprite()
    this.root.position.set(0, ARENA_Y)
    this.root.alpha = 0
    for (const key in Arena.MAP) {
      const [col, row] = Arena.MAP[key]
      this._frames[key] = frameTexture(sheet, col * ARENA_W, row * ARENA_H, ARENA_W, ARENA_H)
    }
  }
  set(arena: string): void {
    const tex = this._frames[arena]
    if (tex) this.root.texture = tex
  }
  show(): void { this._targetAlpha = 1 }
  hide(): void { this._targetAlpha = 0 }
  update(): void { this.root.alpha = approach(this.root.alpha, this._targetAlpha, FADE_FACTOR, 0.01) }
}

/** Shared fighter sprite (slides in from off-screen, blinks on damage). */
abstract class Fighter {
  readonly root: Sprite
  private readonly _shownX: number
  private readonly _hiddenX: number
  private _targetX: number
  constructor(isPlayer: boolean) {
    this.root = new Sprite()
    if (isPlayer) {
      this._shownX = 64
      this._hiddenX = -FIGHTER
      this.root.position.set(this._hiddenX, ARENA_Y + 171)
    } else {
      this._shownX = VIEW_WIDTH - 96 - FIGHTER // 416
      this._hiddenX = VIEW_WIDTH
      this.root.position.set(this._hiddenX, ARENA_Y + 64)
    }
    this._targetX = this._hiddenX
  }
  show(): void { this._targetX = this._shownX }
  hide(): void { this._targetX = this._hiddenX }
  update(): void { this.root.position.x = approach(this.root.position.x, this._targetX, SLIDE_FACTOR, 0.5) }
  /** Blink six times (legacy damage animation). */
  damage(): Promise<void> {
    return new Promise(resolve => {
      let blinks = 6
      const id = window.setInterval(() => {
        if (!blinks) {
          clearInterval(id)
          this.root.alpha = 1
          return resolve()
        }
        this.root.alpha = blinks % 2
        blinks--
      }, 100)
    })
  }
}

class PlayerFighter extends Fighter {
  constructor(playerBack: Texture) {
    super(true)
    this.root.texture = playerBack
  }
}

class EnemyFighter extends Fighter {
  private readonly _frames: Record<string, Texture> = {}
  // [col, row] in the 4x4 fighters sheet (legacy index mapping).
  private static readonly MAP: Record<string, [number, number]> = {
    Brett: [0, 0], Scott: [0, 1], Christian: [0, 2],
    TimD: [1, 0], Uzair: [1, 1],
    TimH: [2, 0], Sarah: [2, 1],
    Cody: [3, 0], Blake: [3, 1]
  }
  constructor(sheet: Texture) {
    super(false)
    for (const key in EnemyFighter.MAP) {
      const [col, row] = EnemyFighter.MAP[key]
      this._frames[key] = frameTexture(sheet, col * FIGHTER, row * FIGHTER, FIGHTER, FIGHTER)
    }
  }
  set(name: string): void {
    const tex = this._frames[name]
    if (tex) this.root.texture = tex
  }
}

/** Vertical health bar (fades in; drains smoothly toward the current health). */
class HP {
  readonly root: Container
  private readonly _bar: Graphics
  private readonly _color: number
  private _health = 100
  private _displayHealth = 100
  private _damage = 0
  private _targetAlpha = 0
  constructor(isPlayer: boolean) {
    this.root = new Container()
    this.root.alpha = 0
    this._color = isPlayer ? 0x2ecc40 : 0xff4136
    this._bar = new Graphics()
    const border = new Graphics().rect(0, 0, HP_W, HP_H).stroke({ width: 2, color: 0x000000 })
    this.root.addChild(this._bar, border)
    this.root.position.set(
      isPlayer ? 2 : VIEW_WIDTH - HP_W - 2,
      isPlayer ? ARENA_Y + 197 : ARENA_Y + 2
    )
    this.redraw()
  }
  private redraw(): void {
    const h = (HP_H * this._displayHealth) / 100
    this._bar.clear().rect(0, 0, HP_W, h).fill(this._color)
  }
  setDamageCounter(damage: number): void { this._damage = damage }
  damage(): void { this._health = Math.max(0, this._health - this._damage) }
  get isDead(): boolean { return this._health === 0 }
  get isLow(): boolean { return this._health <= 10 }
  reset(): void {
    this._health = 100
    this._displayHealth = 100
    this.redraw()
  }
  show(): void { this._targetAlpha = 1 }
  hide(): void { this._targetAlpha = 0 }
  update(): void {
    this.root.alpha = approach(this.root.alpha, this._targetAlpha, FADE_FACTOR, 0.01)
    if (this._displayHealth !== this._health) {
      this._displayHealth = approach(this._displayHealth, this._health, DRAIN_FACTOR, 0.3)
      this.redraw()
    }
  }
}

/** Shared UI box (beige rounded rect, slides in from the side). */
abstract class UI {
  readonly root: Container
  private readonly _shownX: number
  private readonly _hiddenX: number
  private _targetX: number
  protected constructor(isPlayer: boolean) {
    this.root = new Container()
    const box = new Graphics()
      .roundRect(0, 0, UI_W, UI_H, 6)
      .fill(0xf5f5dc)
      .stroke({ width: 3, color: 0x000000 })
    this.root.addChild(box)
    if (isPlayer) {
      this._shownX = VIEW_WIDTH - UI_W - 2
      this._hiddenX = VIEW_WIDTH
      this.root.position.set(this._hiddenX, ARENA_Y + 197)
    } else {
      this._shownX = 2
      this._hiddenX = -UI_W
      this.root.position.set(this._hiddenX, ARENA_Y + 2)
    }
    this._targetX = this._hiddenX
  }
  show(): void { this._targetX = this._shownX }
  hide(): void { this._targetX = this._hiddenX }
  update(): void { this.root.position.x = approach(this.root.position.x, this._targetX, SLIDE_FACTOR, 0.5) }
}

/** Enemy message box with typewriter. */
class EnemyUI extends UI {
  private readonly _text: Text
  private _intervalId: number = null
  constructor() {
    super(false)
    this._text = new Text({
      text: '',
      style: { fontFamily: BATTLE_FONT, fontSize: 13, fill: 0x000000, wordWrap: true, wordWrapWidth: UI_W - 20 }
    })
    this._text.position.set(10, 8)
    this.root.addChild(this._text)
  }
  writeText(text: string): Promise<void> {
    return new Promise(resolve => {
      const message = text.split('')
      this._text.text = ''
      clearInterval(this._intervalId)
      this._intervalId = window.setInterval(() => {
        if (!message.length) {
          clearInterval(this._intervalId)
          return resolve()
        }
        this._text.text += message.shift()
      }, 50)
    })
  }
  reset(): void { this._text.text = '' }
}

type AnswerMark = 'correct' | 'wrong' | undefined

/** Player answer box: 4 choices with selection + correct/wrong highlighting. */
class PlayerUI extends UI {
  private readonly _answers: Text[] = []
  private _raw: string[] = ['', '', '', '']
  private readonly _marks: AnswerMark[] = [undefined, undefined, undefined, undefined]
  private _selectedAnswer = 0
  constructor() {
    super(true)
    for (let i = 0; i < 4; i++) {
      const text = new Text({
        text: '',
        style: { fontFamily: BATTLE_FONT, fontSize: 12, fill: 0x000000, wordWrap: true, wordWrapWidth: UI_W - 28 }
      })
      text.position.set(12, 8 + i * 22)
      this._answers.push(text)
      this.root.addChild(text)
    }
    this.redraw()
  }
  private redraw(): void {
    for (let i = 0; i < this._answers.length; i++) {
      const text = this._answers[i]
      text.text = (i === this._selectedAnswer ? '> ' : '  ') + (this._raw[i] || '')
      const mark = this._marks[i]
      text.style.fill = mark === 'correct' ? 0x2ecc40
        : mark === 'wrong' ? 0xff4136
        : i === this._selectedAnswer ? 0xb8860b
        : 0x000000
    }
  }
  setAnswers(answers: string[]): void {
    this._raw = answers.slice()
    this.redraw()
  }
  get selectedAnswer(): number { return this._selectedAnswer }
  setCorrect(): void { this._marks[this._selectedAnswer] = 'correct'; this.redraw() }
  setWrong(): void { this._marks[this._selectedAnswer] = 'wrong'; this.redraw() }
  resetSelection(): void {
    this._marks.fill(undefined)
    this._selectedAnswer = 0
    this.redraw()
  }
  selectNextAnswer(): void {
    this._selectedAnswer = (this._selectedAnswer + 1) % this._answers.length
    this.redraw()
  }
  selectPreviousAnswer(): void {
    this._selectedAnswer = (this._selectedAnswer - 1 + this._answers.length) % this._answers.length
    this.redraw()
  }
}

export interface PixiBattleComponents {
  arena: Arena
  backdrop: BackDrop
  enemyFighter: EnemyFighter
  enemyUI: EnemyUI
  playerFighter: PlayerFighter
  playerUI: PlayerUI
  playerHP: HP
  enemyHP: HP
}

export interface PixiBattle {
  components: PixiBattleComponents
  /** Advance every component's eased transition. Called each tick. */
  update(): void
}

/**
 * Loads the battle sheets and builds the component set into a container added
 * to `parent` (the overlay layer). Returns the components + a frame updater.
 */
export async function createPixiBattle(parent: Container): Promise<PixiBattle> {
  const [arenaSheet, fightersSheet, playerBack] = await Promise.all([
    loadSheet(mapUrlForPath('./assets/images/maps/battle-backgrounds.png')),
    loadSheet(spriteUrlForPath('./assets/images/players/fighters.png')),
    loadSheet(spriteUrlForPath('./assets/images/players/player-back.png'))
  ])

  const components: PixiBattleComponents = {
    backdrop: new BackDrop(),
    arena: new Arena(arenaSheet),
    playerFighter: new PlayerFighter(playerBack),
    enemyFighter: new EnemyFighter(fightersSheet),
    playerHP: new HP(true),
    enemyHP: new HP(false),
    enemyUI: new EnemyUI(),
    playerUI: new PlayerUI()
  }

  const root = new Container()
  // Paint order: backdrop, arena, fighters, HP bars, UI boxes.
  root.addChild(
    components.backdrop.root,
    components.arena.root,
    components.playerFighter.root,
    components.enemyFighter.root,
    components.playerHP.root,
    components.enemyHP.root,
    components.enemyUI.root,
    components.playerUI.root
  )
  parent.addChild(root)

  const all = Object.values(components) as { update(): void }[]
  return {
    components,
    update: () => { for (const c of all) c.update() }
  }
}
