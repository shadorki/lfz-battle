import { Position, Movements } from '.'

export interface NPCData {
  name: string,
  path: string,
  startingPosition: Position,
  positionOnDOM: number[],
  facingPosition: keyof Movements
}
