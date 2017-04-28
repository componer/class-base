export default class DebounceManager {
  /**
  @desc ensure a given task doesn't fire so often that it bricks browser performance
  @param object context: this
  @param string|function factory: function to run, if you pass a string, it will find context[factory]
  @param number wait: time to wait, ms
  @param boolean immediate: whether to run factory right now
  @usage1: `Util.debounce(this, this.request, 200, true)`, run this.request immediately and never run again in 200ms. use first call in 200ms
  @usage2: `Util.debounce(this, 'request', 200)`, run this.request after 200ms,time clock will be reset if you call again. use last call in last 200ms
  @usage3: `var factory = this.alert.bind(this, 'word');Util.debounce(this, factory, 200)`, use bind to pass parameters, if you bind, this will not be change by debounce
  notice:
    1.you can use this in factory function and do not need to use `this.request.bind(this)`, factory will bind context automaticly;
    2.you must pass factory function name, anonymous function is not allow;
    3.no parameters for factory function, unless you use bind and pass function name;
    4.context in arrow function will not change;
  */
  debounce(factory, wait = 200, immediate = false) {
    if(typeof factory === 'string') {
      factory = this[factory]
    }

    if(typeof factory !== 'function') {
      return
    }

    let queue = this._$$debounce = this._$$debounce || {}
    let timer = queue[factory]
    let isCallNow = immediate && !timer
    let call = factory => {
      // original function
      if(typeof factory.prototype === 'object') {
        factory.call(this)
        return
      }
      // bound function or arrow function
      factory()
    }
    let delay = () => {
      delete queue[factory]
      if(!immediate) {
        call(factory)
      }
    }

    clearTimeout(timer)
    queue[factory] = setTimeout(delay, wait)

    if(isCallNow) {
      call(factory)
    }
  }
  debounceFunction(factory, wait = 200, immediate = false) {
    // cache, not build debounce function if the original function is in the queue
    let queue = this._$$debounceFunctions = this._$$debounceFunctions || {}
    let stone = queue[factory]
    if(stone && stone.wait === wait && stone.immediate === immediate) {
      return stone.factory
    }

    let timeout
  	let debfun = function(...args) {
      let call = (func, params) => {
        delete queue[factory]
        // original function
        if(typeof func.prototype === 'object') {
          return func.apply(this, params)
        }
        // bound function or arrow function
        func(...params)
      }
      var delay = () => {
  			timeout = null
  			if(!immediate) {
          call(factory, args)
        }
  		}
  		var isCallNow = immediate && !timeout

  		clearTimeout(timeout)
  		timeout = setTimeout(delay, wait)

      if(isCallNow) {
        call(factory, args)
      }
  	}

    queue[factory] = {
      wait,
      immediate,
      factory,
    }

    return debfun
  }
}
