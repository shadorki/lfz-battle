import { Question } from "./";

export interface QuestionData {
  name: string
  openingMessage: string
  level: number
  enemyBackgroundPosition: number[]
  battleBackgroundPosition: number[]
  losingMessage: string
  winningMessage: string
  questions: Question[]
  damageToEnemy: number
  damageToPlayer: number
}
