export default class ClassBase {
    constructor() {
        this.init.apply(this, arguments)
        return this
    }

    /**
     * @desc initialize class method, be called every time class is initialized
     * Notice: never use constructor when extends by a sub class
     */
    init() {}

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
