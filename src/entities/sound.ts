import { Observer } from './'
import { Delay, Task, TaskQueue } from '../helpers'
import { Levels, SoundFile } from '../interfaces'

export class Sound extends Observer {
  private _path: string
  private _sounds : {
    [key: string]: HTMLAudioElement
  }
  private _isMuted: boolean
  private _currentLevel: string
  constructor(currentLevel: string) {
    super()
    this._acceptedTasks = new Set([
      'toggle-sound',
      'scene-transition-start',
      'battle-health-low',
      'battle-damage',
      'battle-end',
      'battle-start',
      'interaction',
      'dialogue',
      'battle',
      'wall-bump'
    ])
    this._path = './assets/audio/'
    this._sounds = null
    this._isMuted = true
    this._currentLevel = currentLevel
  }
  get isMuted(): boolean {
    return this._isMuted
  }
  set isMuted(bool: boolean) {
    this._isMuted = bool
    for (const key in this._sounds) {
      this._sounds[key].volume = this._isMuted ? 0 : .3
    }
    console.log(this._isMuted)
  }
  stopAllSounds(): void {
    for(const key in this._sounds) {
      this._sounds[key].pause()
      this._sounds[key].currentTime = 0
    }
  }
  handleUpdate({ name, action }: Task): void {
    switch (name) {
      case 'toggle-sound':
        this.handleToggleSound()
      break;
      case 'scene-transition-start':
        this.handleSceneTransitionStart(action)
      break;
      case 'battle-start':
        this.handleBattleStart()
      break;
      case 'battle-damage':
        this.handleBattleDamage()
      break;
      case 'battle-end':
        this.handleBattleEnd()
        break;
      case 'battle-health-low':
        this.handleBattleHealthLow()
      break;
      case 'interaction':
      case 'dialogue':
      case 'battle':
        this.handleSelect()
      break;
      case 'wall-bump':
        this.handleWallBump()
      break;
      }
    }
  handleWallBump(): void {
    this._sounds.wall.play()
  }
  handleSelect(): void {
    this._sounds.select.currentTime = 0
    this._sounds.select.play()
  }
  handleBattleEnd(): void {
    this.stopAllSounds()
    this.playMapSound(this._currentLevel)
  }
  handleBattleDamage(): void {
    this._sounds.battleDamage.play()
  }
  handleBattleHealthLow(): void {
    this._sounds.lowHealth.play()
  }
  handleBattleStart(): void {
    this.stopAllSounds()
    this._sounds.battleStart.play()
  }
  handleToggleSound(): void {
    this.isMuted = !this.isMuted
  }
  playMapSound(level: string) {
    let sound = null
    switch(level) {
      case 'pokemonCenter':
        sound = 'pokemonCenter'
      break
      default:
        sound = 'map'
      break
    }
    this._sounds[sound].play()
  }
  async handleSceneTransitionStart({ level }: any): Promise<void> {
    this._currentLevel = level
    if ([
      'gymArena1PostBattle',
      'gymArena2PostBattle',
      'gymArena3PostBattle',
      'gymArena4PostBattle',
      'gymArena5PostBattle'
    ].some(l => l === level)) return
    this.stopAllSounds()
    this._sounds.doorEnter.play()
    await Delay.delay(500)
    this.playMapSound(level)
    console.log('sound finished')
  }
  async loadSound(
    file: string,
    key:string,
    isLooping: boolean
    ): Promise<{[key: string]: HTMLAudioElement}> {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.volume = 0
      audio.loop = isLooping
      audio.onloadeddata = () => resolve({[key]: audio})
      audio.onerror = () => reject()
      audio.src = file
    })
  }
  async init(): Promise<void> {
    const soundFiles: SoundFile[] = [
      {
        key: 'doorEnter',
        file: 'door-enter.mp3',
        isLooping: false
      },
      {
        key: 'lowHealth',
        file: 'low-health.mp3',
        isLooping: false
      },
      {
        key: 'battleDamage',
        file: 'battle-damage.mp3',
        isLooping: false
      },
      {
        key: 'battleStart',
        file: 'battle-start.mp3',
        isLooping: true
      },
      {
        key: 'pokemonCenter',
        file: 'pokemon-center.mp3',
        isLooping: true
      },
      {
        key: 'select',
        file: 'select.mp3',
        isLooping: false
      },
      {
        key: 'wall',
        file: 'wall.mp3',
        isLooping: false
      },
      {
        key: 'map',
        file: 'map.mp3',
        isLooping: true
      }
    ]
   const sounds = await Promise.all(soundFiles.map(({key, file, isLooping}) => (
     this.loadSound(`${this._path}${file}`, key, isLooping)
   )))
   this._sounds = sounds.reduce((all, sound) => ({ ...all, ...sound }))
   this.playMapSound(this._currentLevel)
  }
}
