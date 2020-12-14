import { Position } from './'

export interface Movements {
  up: (arg0?: Position) => number
  left: (arg0?: Position) => number
  right: (arg0?: Position) => number
  down: (arg0?: Position) => number
}
