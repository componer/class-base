import MixClass from './mix'
import DataManager from './data'
import EventsManger from './event'
import DebounceManager from './debounce'
import ClassBase from './class-base'

class Base extends MixClass.mixin(MixClass, DataManager, EventsManger, DebounceManager, ClassBase) {
  constructor() {
    super()
    ClassBase.constructor.apply(this, arguments)
  }
}

export {
  MixClass,
  DataManager,
  EventsManger,
  DebounceManager,
  ClassBase,
  Base as default,
}
