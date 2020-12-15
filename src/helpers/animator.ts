import { Animations } from "../interfaces/animations"
import { Animation } from './animation'

export class Animator {
  private _animations: Animations
  private _animatedElement: HTMLElement
  constructor(animatedElement: HTMLElement) {
    this._animations = {}
    this._animatedElement = animatedElement
  }
  get animatedElement(): HTMLElement {
    return this._animatedElement
  }
  addAnimation(name: string, sheet: number[][], speed: number): void {
    const animation = new Animation(name, sheet, speed, this.animatedElement)
    this._animations[name] = animation
  }
  play(name: string): void {
    if(!this._animations[name]) throw new Error(`Missing Animation named ${name}`)
    this._animations[name].play()
  }
}
