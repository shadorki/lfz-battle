import { Task } from "../helpers";
import { Question } from "./";

export interface QuestionData {
  name: string
  sprite: string
  title: string
  openingMessage: string
  level: number
  arena: string
  losingMessage: string
  winningMessage: string
  questions: Question[]
  damageToEnemy: number
  damageToPlayer: number
  onWin: Task
  onLoss: Task
}
