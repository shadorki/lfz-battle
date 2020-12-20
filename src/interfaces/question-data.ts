import { Question } from "./";

export interface QuestionData {
  name: string
  openingMessage: string
  health: number
  level: number
  enemyBackgroundPosition: number[]
  battleBackgroundPosition: number[]
  losingMessage: string
  winningMessage: string
  questions: Question[]
}
