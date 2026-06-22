import { Observer } from './'
import { Task } from '../helpers'
import { MapView } from '../render/views'

/**
 * Swaps the rendered map background when the level changes. Keeps map rendering
 * out of Level (which stays pure collision/data). The URL resolver is injected
 * so this entity doesn't depend on the asset layer directly.
 */
export class MapRenderer extends Observer {
  private _view: MapView
  private _resolveMapUrl: (level: string) => string
  constructor(view: MapView, resolveMapUrl: (level: string) => string) {
    super()
    this._view = view
    this._resolveMapUrl = resolveMapUrl
    this._acceptedTasks = new Set(['scene-transition-start'])
  }
  handleUpdate({ name, action }: Task): void {
    if (name !== 'scene-transition-start') return
    this._view.setMap(this._resolveMapUrl(action.level))
  }
}
