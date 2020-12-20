import { Question } from "./";

export interface QuestionData {
  name: string
  openingMessage: string
  level: number
  battleBackground: string
  losingMessage: string
  winningMessage: string
  questions: Question[]
  damageToEnemy: number
  damageToPlayer: number
}
