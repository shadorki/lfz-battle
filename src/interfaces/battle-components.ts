import { Arena, BackDrop, EnemyFighter, EnemyUI, HP, PlayerFighter, PlayerUI } from "../entities/battle";

export interface BattleComponents {
  arena: Arena
  backdrop: BackDrop
  enemyFighter: EnemyFighter
  enemyUI: EnemyUI
  playerFighter: PlayerFighter
  playerUI: PlayerUI
  playerHP: HP
  enemyHP: HP
}
