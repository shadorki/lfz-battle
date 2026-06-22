import { Task, TaskQueue } from '../helpers'
import { DialogueData, Interaction, Levels, SceneTransition } from '../interfaces'
import { Observer } from './'
import { dialogueData } from '../data'
import { DialogueView } from '../render/views'

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
  private _view: DialogueView
  private _content: string
  private _isShowing: boolean
  constructor(taskQueue: TaskQueue, currentLevel: keyof Levels, view: DialogueView) {
    super()
    this._acceptedTasks = new Set(['npc-interaction-start', 'scene-transition-start', 'dialogue', 'npc-interaction-end', 'battle-start', 'npc-battle-end'])
    this._currentLevel = currentLevel
    this._currentDialogue = []
    this._writingIntervalId = null
    this._currentWritingText = []
    this._taskQueue = taskQueue
    this._dialogues = dialogueData[currentLevel]
    this._view = view
    this._content = ''
    this._isShowing = false
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
  handleNPCBattleEnd({ name, level }: any): void {
    dialogueData[level][name].hasBattled = true
  }
  handleNPCInteractionEnd() {
    this.hide()
    this.heading = ''
    this.content = ''
    this._currentWritingText = []
  }
  handleDialogue(): void {
    if (this._currentWritingText.length) {
      clearInterval(this._writingIntervalId)
      this.content = this.content + this._currentWritingText.join('')
      this._currentWritingText = []
      return
    }
    const { text, isTrigger, type, action } = this._currentDialogue.shift()
    if (isTrigger) {
      if (Array.isArray(type) || Array.isArray(action)) {
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
      if (!this._currentWritingText.length) {
        clearInterval(this._writingIntervalId)
        return
      }
      const letter = this._currentWritingText.shift()
      this.content = this.content + letter
    }, 50)
  }
  handleSceneTransitionStart({ level }: SceneTransition): void {
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
    if (this._isShowing) this._view.show()
    else this._view.hide()
  }
  set heading(text: string) {
    this._view.setHeading(text)
  }
  get content(): string {
    return this._content
  }
  set content(text: string) {
    this._content = text
    this._view.setContent(text)
  }
}
