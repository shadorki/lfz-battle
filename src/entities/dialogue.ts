import { Task, TaskQueue } from '../helpers'
import { DialogueData, Interaction, Levels, SceneTransition } from '../interfaces'
import { Observer } from './'
import { dialogueData } from '../data'

export class Dialogue extends Observer {
  private _currentLevel: keyof Levels
  private _dialogues: {
    hasBattled?: boolean
    preBattle?: DialogueData[]
    postBattle?: DialogueData[]
  }
  private _currentDialogue: DialogueData[]
  private _taskQueue: TaskQueue
  private _writingIntervalId: number
  private _currentWritingText: string[]
  public containerElement: HTMLElement
  public headingElement: HTMLElement
  public contentElement: HTMLElement
  private _isShowing: boolean
  constructor(taskQueue: TaskQueue, currentLevel: keyof Levels) {
    super()
    this._acceptedTasks = new Set(['npc-interaction-start', 'scene-transition-start', 'dialogue', 'npc-interaction-end', 'battle-start', 'npc-battle-end'])
    this._currentLevel = currentLevel
    this._currentDialogue = []
    this._writingIntervalId = null
    this._currentWritingText = []
    this._taskQueue = taskQueue
    this._dialogues = dialogueData[currentLevel]
    this._isShowing = false
    this.containerElement = null
    this.headingElement = null
    this.contentElement = null
  }
  handleUpdate({ name, action }: Task): void {
    switch (name) {
      case 'npc-interaction-start':
        this.handleNPCInteractionStart(action)
      break
      case 'npc-interaction-end':
        this.handleNPCInteractionEnd()
        break
      case 'scene-transition-start':
        this.handleSceneTransitionStart(action)
      break
      case 'dialogue':
        this.handleDialogue()
      break
      case 'battle-start':
        this.handleNPCInteractionEnd()
      break
      case 'npc-battle-end':
        this.handleNPCBattleEnd(action)
      break
    }
  }
  handleNPCBattleEnd({ name, level}: any): void {
    dialogueData[level][name].hasBattled = true
  }
  handleNPCInteractionEnd() {
    this.hide()
    this.heading = ''
    this.content = ''
    this._currentWritingText = []
  }
  handleDialogue(): void {
    if(this._currentWritingText.length) {
      clearInterval(this._writingIntervalId)
      this.content = this.content + this._currentWritingText.join('')
      this._currentWritingText = []
      return
    }
    const { text, isTrigger, type, action } = this._currentDialogue.shift()
    if(isTrigger) {
      if(Array.isArray(type) || Array.isArray(action)) {
        action.forEach((a: any, i: number) => {
          this._taskQueue.addTask(
            new Task(
              type[i],
              a
            )
          )
        })
      } else {
        this._taskQueue.addTask(
          new Task(
            type,
            action || null
          )
        )
      }
      return
    }
    this._currentWritingText = text.split('')
    this.writeText()
  }
  handleNPCInteractionStart(action: Interaction) {
    const { name } = action
    const dialogue = this._dialogues[name]
    this._currentDialogue = [...dialogue.hasBattled ? dialogue.postBattle : dialogue.preBattle]
    const { text } = this._currentDialogue.shift()
    this.heading = name
    this._currentWritingText = text.split('')
    this.writeText()
    this.show()
  }
  writeText() {
    this.content = ''
    this._writingIntervalId = window.setInterval(() => {
      if(!this._currentWritingText.length) {
        clearInterval(this._writingIntervalId)
        return
      }
      const letter = this._currentWritingText.shift()
      this.content = this.content + letter
    }, 50)
  }
  handleSceneTransitionStart({ level }: SceneTransition): void{
    this._dialogues = dialogueData[level]
    this._currentLevel = level
    // Edge case, in too deep, need bandaid :(
    if (level === 'home') dialogueData.gymArena6.Uzair.hasBattled = false
  }
  show(): void {
    this.isShowing = true
  }
  hide(): void {
    this.isShowing = false
  }
  get isShowing(): boolean {
    return this._isShowing
  }
  set isShowing(bool: boolean) {
    this._isShowing = bool
    if(this._isShowing) {
      this.containerElement.style.bottom = '20px'
      this.containerElement.style.opacity = '1'
    } else {
      this.containerElement.style.bottom = '-115px'
      this.containerElement.style.opacity = '0'
    }
  }
  set heading(text: string) {
    this.headingElement.textContent = text
  }
  get content(): string {
    return this.contentElement.textContent
  }
  set content(text: string) {
    this.contentElement.textContent = text
  }
  createElement(): void {
    const container = document.createElement('div')
    container.style.width = '500px'
    container.style.height = '120px'
    container.style.bottom = '-115px'
    container.style.opacity = '0'
    container.style.position = 'absolute'
    container.style.border = '6px solid rosybrown'
    container.style.borderRadius = '6px'
    container.style.backgroundColor = 'beige'
    container.style.transition = 'bottom 300ms, opacity 300ms'
    container.style.zIndex = '2'
    const heading = document.createElement('div')
    heading.style.fontSize = '18px'
    heading.style.paddingLeft = '8px'
    const headingLine = document.createElement('hr')
    headingLine.style.margin = '2px 0'
    const content = document.createElement('div')
    content.style.padding = '0 8px'
    container.append(
      heading,
      headingLine,
      content
    )
    this.headingElement = heading
    this.contentElement = content
    this.containerElement = container
  }
  init(): HTMLElement {
    this.createElement()
    return this.containerElement
  }
}
