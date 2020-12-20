import { Task, TaskQueue } from '../../helpers'
import { Observer } from '../'
import { battleData } from '../../data'
import { BattleData, Levels, Question, QuestionData } from '../../interfaces'
import { HP } from '.'

export class Battle extends Observer {
  private _acceptedTasks: Set<string>
  private _taskQueue: TaskQueue
  private _currentLevel: keyof Levels
  private _currentQuestions: Question[]
  private _currentQuestionData: QuestionData
  private _battleData: BattleData
  private _startingBattleLifeCycle: string[]
  private _playerHP: HP
  private _enemyHP: HP
  private _playerUI: UI
  private _battleBackDrop: HTMLElement
  private _battleAreaContainer: HTMLElement
  private _enemyCharacter: HTMLElement
  private _enemyHealthBarContainer: HTMLElement
  private _enemyHealthbar: HTMLElement
  private _playerCharacter: HTMLElement
  private _playerHealthBarContainer: HTMLElement
  private _playerHealthBar: HTMLElement
  private _enemyUIContainer: HTMLElement
  private _playerUIContainer: HTMLElement
  constructor(taskQueue: TaskQueue, currentLevel: keyof Levels) {
    super()
    this._acceptedTasks = new Set(['battle-start'])
    this._currentLevel = currentLevel
    this._taskQueue = taskQueue
    this._battleData = battleData
    this._currentQuestionData = battleData[currentLevel]
    this._currentQuestions = null
    this._startingBattleLifeCycle = [
      'setupBackdrop',
      'setupBattleBackground',
      'loadInCharacters',
      'loadEnemyUI',
      'showStartingMessage',
      'showOpeningMessage',
      'loadHealthBars',
      'beginQuestion',
      'loadPlayerUI'
    ]
  }
  handleUpdate({ name, action }: Task): void {
    if (!this._acceptedTasks.has(name)) return
    switch (name) {
      case 'battle-start':
        this.handleBattleStart(action)
        break
    }
  }
  handleBattleStart(action: any): void {
    throw new Error('Method not implemented.')
  }
  // writeText() {
  //   this.content = ''
  //   this._writingIntervalId = window.setInterval(() => {
  //     if (!this._currentWritingText.length) {
  //       clearInterval(this._writingIntervalId)
  //       return
  //     }
  //     const letter = this._currentWritingText.shift()
  //     this.content = this.content + letter
  //   }, 50)
  // }
  loadPlayerUI(): void {
    throw new Error('Method not implemented.')
  }
  beginQuestion(): void {
    throw new Error('Method not implemented.')
  }
  loadHealthBars(): void {
    throw new Error('Method not implemented.')
  }
  showOpeningMessage(): void {
    throw new Error('Method not implemented.')
  }
  showStartingMessage(): void {
    throw new Error('Method not implemented.')
  }
  loadEnemyUI(): void {
    throw new Error('Method not implemented.')
  }
  loadInCharacters(): void {
    throw new Error('Method not implemented.')
  }
  setupBattleBackground(): void {
    throw new Error('Method not implemented.')
  }
  setupBackdrop(): void {
    throw new Error('Method not implemented.')
  }
}
