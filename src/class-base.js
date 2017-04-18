var EventsManger = new WeakMap()
var DataManager = new WeakMap()
var copyProperty = (Target, Source) => {
    for(let key of Reflect.ownKeys(Source)) {
        if(key !== 'constructor' && key !== 'prototype' && key !== 'name') {
            let descriptor = Object.getOwnPropertyDescriptor(Source, key)
            Object.defineProperty(Target, key, descriptor)
        }
    }
}

export default class ClassBase {
    constructor(...args) {
        DataManager.set(this, {})
        EventsManger.set(this, {})
        this.initialize.apply(this, args)
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
        let data = DataManager.get(this)

        // without . in key
        if(key.indexOf('.') === -1) return data[key]

        // with . in key
        let nodes = key.split('.').map(item => item.trim())

        // but key is not available, like: 'a..c'
        if(nodes.indexOf('') !== -1) return

        // find out key->value
        let target = data = data || {}
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
        let data = DataManager.get(this)

        // without . in key
        if(key.indexOf('.') === -1) {
            data[key] = value
            DataManager.set(this, data)

            if(notify) {
                this.trigger('change:' + key, value)
            }
            return this
        }

        // with . in key
        let nodes = key.split('.').map(item => item.trim())
        // but key is not available, like: 'a..c'
        if(nodes.indexOf('') !== -1) return this
        // find out the real key->value, and update it
        let target = data = data || {}
        let rootKey = nodes[0]
        let targetKey = nodes.pop()
        for(let node of nodes) {
            if(!target[node]) {
                target[node] = {}
            }
            target = target[node]
        }
        target[targetKey] = value
        DataManager.set(this, data)

        if(notify) {
            // bubbling up, notify parent node's events, from children to root
            let evt = key
            let followers = ''
            while(evt !== '' && evt.length > 0) {
                this.trigger('change:' + evt, {
                    dataObject: data[rootKey],
                    target: key,
                    trigger: evt,
                    value,
                })
                followers = evt.substr(evt.lastIndexOf('.') + 1) + (followers === '' ? '' : '.') + followers
                evt = evt.substr(0, evt.lastIndexOf('.'))
            }
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
     * @param number order: the order to call function. functions are listed one by one with using order. Notice, if you pass a same function twice with different order, it works.
     */
    on(evts, handler, order = 10) {
        let events = EventsManger.get(this)
        evts = evts.split(' ')
        evts.forEach(evt => {
            if(!events[evt]) {
                events[evt] = {}
            }
            let node = events[evt]

            if(!node[order]) {
                node[order] = []
            }
            let hdles = node[order]

            // make sure only once in one order
            if(hdles.indexOf(handler) === -1) {
                hdles.push(handler)
            }
        })
        EventsManger.set(this, events)

        return this
    }
    /**
     * @desc remove event handlers
     * @param string evt: event name, only one event supported
     * @param function handler: the function wanted to remove, notice: if you passed it twice, all of them will be removed. If you do not pass handler, all handlers of this event will be removed.
     */
    off(evt, handler) {
        let events = EventsManger.get(this)
        if(!handler) {
            events[evt] = {}
            return
        }

        // delete all
        if(!evt) {
            EventsManger.set(this, {})
            return thiss
        }

        let node = events[evt]
        if(!node) return

        let orders = Object.keys(node)

        if(!orders || orders.length === 0) return
        if(orders.length > 1) {
            orders = orders.sort((a, b) => a < b ? -1 : a > b ? 1 : 0)
        }

        orders.forEach(order => {
            let hdles = node[order]
            let index = hdles.indexOf(handler)
            if(index > -1) hdles.splice(index, 1) // delete it/them
            if(hdles.length === 0) delete node[order]
        })

        EventsManger.set(this, events)
        return this
    }
    /**
     * @desc trigger events handlers
     * @param string event: which event to trigger
     * @param args: arguments to pass to handler function
     */
    trigger(evt, ...args) {
        let events = EventsManger.get(this)
        let node = events[evt]
        if(!node) return

        let orders = Object.keys(node)

        if(!orders || orders.length === 0) return
        if(orders.length > 1) {
            orders.sort((a, b) => a < b ? -1 : a > b ? 1 : 0)
        }

        let handlers = []
        orders.forEach(order => {
            let hdles = node[order]
            handlers = [...handlers, ...hdles]
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

    // class name
    toString() {
        return this.constructor.name
    }
}
