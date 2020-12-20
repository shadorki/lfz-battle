import { QuestionData } from "./";

export interface BattleData {
  [key: string]: {
    [key: string]: QuestionData
  }
}
