import MixClass from './mix'
import DataManager from './data'
import EventsManger from './event'
import DebounceManager from './debounce'

export default class ClassBase extends MixClass.mixin(DataManager, EventsManger, DebounceManager) {
    constructor(...args) {
        super()
        this.initialize.apply(this, args)
        return this
    }

    /**
     * @desc initialize class method, be called every time class is initialized
     * Notice: never use constructor when extends by a sub class
     */
    initialize() {}

    /**
     * @desc call some function out of this class bind with this
     * @param function factory: the function to call
     * @param args: arguments to pass to function be called
     */
    call(factory, ...args) {
        factory.apply(this, args)
        return this
    }

    // class name
    toString() {
        return this.constructor.name
    }
}
