import DebounceManager from './debounce'

export default class EventsManger extends DebounceManager {
    /**
     * @desc bind events on Instantiate objects
     * @param string evts: events want to bind, use ' ' to split different events, e.g. .on('change:data change:name', ...)
     * @param function handler: function to call back when event triggered
     * @param number order: the order to call function. functions are listed one by one with using order. Notice, if you pass a same function twice with different order, it works.
     * @param boolean debounce: whether run the handler function only once in a short time
     */
    on(evts, handler, order = 10, debounce = false) {
        let events = this._$$events = this._$$events || {}
        let factory = debounce ? this.debounceFunction(handler) : handler
        evts = evts.split(' ')
        evts.forEach(evt => {
            let node = events[evt] = events[evt] || {}
            let hdles = node[order] = node[order] || []
            // make sure only once in one order
            if(hdles.indexOf(factory) === -1) {
                hdles.push(factory)
            }
        })

        return this
    }
    /**
     * @desc remove event handlers
     * @param string evt: event name, only one event supported
     * @param function handler: the function wanted to remove, notice: if you passed it twice, all of them will be removed. If you do not pass handler, all handlers of this event will be removed.
     */
    off(evt, handler) {
        let events = this._$$events = this._$$events || {}

        if(!handler) {
            events[evt] = {}
            return this
        }

        if(!evt) {
            this._$$events = {}
            return this
        }

        let node = events[evt]
        if(!node) return this

        let orders = Object.keys(node)
        if(!orders || orders.length === 0) return this
        if(orders.length > 1) {
            orders = orders.sort((a, b) => a < b ? -1 : a > b ? 1 : 0)
        }

        orders.forEach(order => {
            let hdles = node[order]
            let index = hdles.indexOf(handler)
            if(index > -1) hdles.splice(index, 1) // delete it/them
            if(hdles.length === 0) delete node[order]
        })

        return this
    }
    /**
     * @desc trigger events handlers
     * @param string event: which event to trigger
     * @param args: arguments to pass to handler function
     */
    trigger(evt, ...args) {
        let events = this._$$events = this._$$events || {}

        let node = events[evt]
        if(!node) return this

        let orders = Object.keys(node)
        if(!orders || orders.length === 0) return this
        if(orders.length > 1) {
            orders.sort((a, b) => a < b ? -1 : a > b ? 1 : 0)
        }

        let handlers = []
        orders.forEach(order => {
            let hdles = node[order]
            handlers = handlers.concat(hdles)
        })

        handlers.forEach(handler => {
            if(typeof handler === 'function') {
                handler.apply(this, args)
            }
            else if(typeof this[handler] === 'function') {
                this[handler].apply(this, args)
            }
        })

        return this
    }
}
