import EventsManger from './event'

export default class DataManager extends EventsManger {
    /**
     * @desc get data from data manager
     * @param string key: the key of data, you can use '.' to get tree info. e.g. .get('root.sub.ClassBaseMix') => .get('root').sub.ClassBaseMix
     */
    get(key) {
        let data = this._$$data = this._$$data || {}

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
        let data = this._$$data = this._$$data || {}

        // without . in key
        if(key.indexOf('.') === -1) {
            data[key] = value
            if(notify) {
                this.trigger('change:' + key, {
                    trigger: key, // which event has been triggered
                    target: key, // which data has been changed
                    data: value, // data content
                })
            }
            return this
        }

        // with . in key
        let nodes = key.split('.').map(item => item.trim())
        // but key is not available, like: 'a..c'
        if(nodes.indexOf('') !== -1) return this
        // find out the real key->value, and update it
        let target = data
        let targetKey = nodes.pop()
        for(let node of nodes) {
            target = target[node] = target[node] || {}
        }
        target[targetKey] = value

        if(notify) {
            // bubbling up, notify parent node's events, from children to root
            let evt = key
            while(evt !== '' && evt.length > 0) {
                this.trigger('change:' + evt, {
                    trigger: evt,
                    target: key,
                    data: value,
                })
                evt = evt.substr(0, evt.lastIndexOf('.'))
            }
        }

        return this
    }
}
