var events = {}
var data = {}

function copyProperty(Target, Source) {
    for(let key of Reflect.ownKeys(Source)) {
        if(key !== 'constructor' && key !== 'prototype' && key !== 'name') {
            let descriptor = Object.getOwnPropertyDescriptor(Source, key)
            Object.defineProperty(Target, key, descriptor)
        }
    }
}

export default class ClassBase {
    constructor(...args) {
        events[this] = {}
        data[this] = {}
        this.call(this.initialize, ...args)

        return this
    }

    /**
     * @desc initialize class method, be called every time class is initialized
     * Notice: never use constructor when extends by a sub class
     */
    initialize() {}

    /**
     * @desc get data from data manager
     * @param string key: the key of data, you can use '.' to get tree info. e.g. .get('root.sub.ClassBaseMix') => .get('root').sub.ClassBaseMix
     */
    get(key) {
        let target = data[this]
        if(key.indexOf('.') === -1) return target[key]

        let nodes = key.split('.').filter(item => item && item !== '')
        if(nodes.length === 0) return

        for(let node of nodes) {
            if(typeof target !== 'object' || !target[node]) return
            target = target[node]
        }

        return target
    }
    /**
     * @desc save data to data manager
     * @param string key: the key of data, use '.' to set tree structure. e.g. .set('root.sub.ClassBaseMix', 'value') => .get('root').sub.ClassBaseMix = 'value'
     * @param mix value: the value to save
     * @param boolean notify: whether to trigger data change event
     */
    set(key, value, notify = true) {
        let target = data[this]
        if(key.indexOf('.') === -1) {
            target[key] = value
            if(notify) {
                this.trigger('change:' + key, value)
            }
            return this
        }

        let nodes = key.split('.').filter(item => item && item !== '')
        if(nodes.length === 0) return

        let lastKey = nodes.pop()
        for(let node of nodes) {
            if(typeof target !== 'object') return
            if(!target[node]) {
                target[node] = {}
            }
            target = target[node]
        }
        target[lastKey] = value


        if(notify) {
            let node = nodes.shift()
            // only the root data name change event will be trigger
            // e.g. when you this.set('root.sub'), it will run this.trigger('change:root', value)
            this.trigger('change:' + node, value)
        }

        return this
    }

    /**
     * @desc call some function out of this class bind with this
     * @param function factory: the function to call
     * @param args: arguments to pass to function be called
     */
    call(factory, ...args) {
        factory.apply(this, args)
        return this
    }

    /**
     * @desc bind events on Instantiate objects
     * @param string evts: events want to bind, use ' ' to split different events, e.g. .on('change:data change:name', ...)
     * @param function handler: function to call back when event triggered
     * @param number order: the order to call function. functions are listed one by one with using order.
     */
    on(evts, handler, order = 10) {
        evts = evts.split(' ')
        let target = events[this]
        evts.forEach(evt => {
            if(!target[evt]) target[evt] = {}
            let node = target[evt]

            if(!node[order]) node[order] = []
            let hdles = node[order]
            if(hdles.indexOf(handler) === -1) hdles.push(handler) // make sure only once in one order
        })
        return this
    }
    /**
     * @desc remove event handlers
     * @param string event: event name, only one event supported
     * @param function handler: the function wanted to remove, notice: if you passed it twice, all of them will be removed. If you do not pass handler, all handlers of this event will be removed.
     */
    off(event, handler) {
        if(!handler) {
            events[this][event] = {}
            return
        }

        let node = events[this][event]
        if(!node) return

        let orders = Object.keys(node)

        if(!orders || orders.length === 0) return
        if(orders.length > 1) orders = orders.sort((a, b) => a - b)

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
    trigger(event, ...args) {
        let node = events[this][event]
        if(!node) return

        let orders = Object.keys(node)

        if(!orders || orders.length === 0) return
        if(orders.length > 1) orders = orders.sort((a, b) => a - b)

        let handlers = []
        orders.forEach(order => {
            let hdles = node[order]
            handlers = [...handlers, ...hdles]
        })

        handlers.forEach(handler => {
            if(typeof handler === 'function') {
                this.call(handler, ...args)
            }
        })

        return this
    }

    /**
     * @desc mix this class with other classes, this class property will never be overwrite, the final output class contains certain property and all of this class's property
     * @param Classes: the classes passed to mix, previous class will NOT be overwrite by the behind ones.
     */
    static mixin(...Classes) {
        class ClassBaseMix {}

        Classes.reverse()
        Classes.push(this)
        for(let Mixin of Classes) {
            copyProperty(ClassBaseMix, Mixin)
            copyProperty(ClassBaseMix.prototype, Mixin.prototype)
        }

        return ClassBaseMix
    }
    /**
     * @desc mix other classes into this class, property may be overwrite by passed class, behind class will cover previous class
     */
    static mixto(...Classes) {
        class ClassBaseMix {}

        Classes.unshift(this)
        for(let Mixin of Classes) {
            copyProperty(ClassBaseMix, Mixin)
            copyProperty(ClassBaseMix.prototype, Mixin.prototype)
        }

        return ClassBaseMix
    }

    toString() {
        return `[class ${this.constructor.name}]`
    }
}
