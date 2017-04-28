# Class Base
The basic class for other class to extend.
Provide useful properties.

## Install

```
componer clone class-base -L
```

`-L` is short for `--link`, class-base will be linked into bower_components, and you can use `import ClassBase from 'class-base'` directly.

## Usage

```
import ClassBase from 'class-base'
class MyClass extends ClassBase {
    initialize(options) {} // use initialize instead of constructor
}
```

## Methods/API

###initialize(...args)

The first property function to run automaticly. Use initialize instead of constructor.

###get(key)

Get data from data manager.

```
var m = new ClassBase()
...
var name = m.get('name')
```

Instead of using `this.name`, you should use `this.get('name')` which is more security.

However, you can use `this.get('book.name')` to get book name directly. It equals `this.get('book').name`.

###set(key, value, notify = true)

Save data to data manager.

```
m.set('name', 'new name')
m.set('book.amount', 100) // equals m.get('book').amount = 100
```

When you use set to save a new data, `change` event will be triggered. e.g.

```
m.on('change:name', e => console.log(e))
m.set('name', 'my new name')
```

All of data set by `.set()` will follow this rule.
If you do not want to trigger change event when you set a new data, use the third parameter.

```
m.set('name', 'a name', false)
```

Then, the `change:name` event will not be trigger.

If you use `set('book.name', name)`, events `change:book` and `change:book.name` will be triggered together.

Handler function parameters:

```
m.on('change:book.name', e => console.log(e))
m.set('book.name.length', 12)
```

`e` has three property:

```
{
  trigger: which bind event(s) did you trigger, 'book.name', which is used in 'm.on(change:book.name)'
  target: current trigger event name, 'book.name.length'
  data: value of set
}
```

###call(fun, ...args)

Call a function binded `this`.

```
function a() {
    this.set('name', 'tom')
}
m.call(a)
```

Parameters follow the rule of `function.call`, for example:

```
function change(name) {
    this.set('name', name)
}
m.call(change, 'tom cat')
```

###on(events, handler, order = 10, debounce = false)

Bind events on instance object. For example:

```
m.on('request', this.requestHandler)
...
m.request() // in which has a `this.trigger('request')`
```

In the previous example, when run `m.request()`, requestHandler will run at the trigger hook position.

If you want to bind a handler to several events, use a space to seperate events. e.g.

```
m.on('change:name change:age', this.requestNew)
```

Notice: you do not need to use `this.requestNew.bind(this)`.

If you want to arrange the handler order when triggered, you can pass the third parameter. e.g.

```
m.on('name', this.changeHandler, 30)
m.on('name', this.changeHandler2, 20)
```

When `name` event triggered, changeHandler2 will be run before changeHandler, because the order of it is smaller. Default order is 10.

`debounce` help you to not run your handler function in a short time. If you set it true (default is false), when you trigger your handler function, it will not run again in 200ms. e.g.

```
let change = e => console.log(e.data)
m.on('change:name', change, 1, true)
m.set('name', 1)
m.set('name', 2)
```

Because `change` will only run once in 200ms, so there will be only one log '2'.

###off(event, handler)

Remove a handler from event handler list. Only one event can be passed into off. If you do not pass handler, all handlers of this event will be removed. e.g.

```
m.off('book') // all event handlers will be removed
m.off('book', this.changeHandler) // only changeHandler will be removed
```

If you pass a anonymous function into handler list when you bind, the only way to remove it is using `off(event)`, which will remove all handlers.

Notice: `change:` events may be different.

```
m.off('change:book') // 'change:book.name' is still work
m.off('change:book.name') // you should remove sub data event
```

###trigger(event, ...args)

Trigger event handlers. e.g.

```
m.on('finshed', this.finshedHanlder)
...
m.trigger('finshed')
```

Parameters can be passed by trigger, e.g.

```
function change(name, amount) {
    console.log(name, amount)
}
m.on('book', change)
...
m.trigger('book', 'my new name', 89)
```

###static mixin(...Classes)

Provide a static mixin function to mix other classes into ChartBase. e.g.

```
var NewClass = BaseClass.mixin(ClassA, ClassB)
var n = new NewClass()
console.log(n.toString()) // BaseClass
```

NewClass has all properties of BaseClass, and some of ClassA and ClassB.

###static mixto(...Classes)

Different from `mixin`, using mixto to put all properties into next class. The last class will keep all properties.

```
class ClassB {
    toString() {
        return 'ClassB'
    }
}
var NewClass = BaseClass.mixto(ClassA, ClassB)
var n = new NewClass()
console.log(n.toString()) // ClassB
```

Notice: defference between mixin and mixto.

mixin: from right into left, the left class will keep more properties. (cover the right one)

mixto: from left into right, the right class will keep more properties.

*Extends from mix*

```
class NewClass extends BaseClass.mixin(ClassA, ClassB) {}
var n = new NewClass()
console.log(n.toString()) // NewClass
```

###toString()

Find out the class info.

```
m.toString() // return '[class BaseClass]'
```

###debounce(factory, wait = 200, immediate = false)

Run a function only once in a certain time.

```
let run = () => {}
m.debounce(run, 500)
...
m.debounce(run, 1000)
```

`run` function will run only once after 1000ms. As you see, we use debounce to run a function twice in a short time and give a delay time. However, when we run debounce first time, it will run the function after 500ms, and we run debounce the second time, the first run schedule will be dropped, and it will run the function after 1000ms after the first one dropped.

When immediate is true, the function will run immediately, and in the follow wait time, another debounce will not run. e.g.

```
let run = () => {}
m.debounce(run, 500, true)
...
m.debounce(run, 1000, true)
```

This time, the second run schedule will be dropped, because after the first run, no debounce will be run in 500ms.

The second parameter can be a function or a string.
If you pass a function, it will be bound with `this` automaticly.
If you pass a string, it will find the function which is the same named property of `this`.

```
// use this.request and be bound with this automaticly
this.debounce(this.request, 200, true)
this.debounce('request', 200)

// arrow function will not be bound with any context
let func = () => {}
this.debounce(func, 100)

// use a bound function to pass parameters, will not be bound with other context
let fac = this.request.bind(this, 'url')
this.debounce(fac, 500)
```

**Notice:** you must pass factory function name, anonymous function is not allow.

###debounceFunction(factory, wait = 200, immediate = false)

Create a function, which will use debounce when you run this function.

```
let fac = m.debounceFunction(m.request, 200)
fac(xxx) // this will not run
fac(ooo) // this will run

let fun = m.debounceFunction(m.request, 200, true)
fun(xxx) // this will run
fun(ooo) // this will not run

let afun = m.debounceFunction(name => console.log(name), 200)
afun('tom') // not run
afun('silva') // run
```

The run schedule logic is the same with `m.debounce`. And now you can pass anonymous function, if you use this function only once.

If you have used underscore or lodash... `_.debounce` is almost like `m.debounceFunction`. The difference are:

1. you can use instance's property directly, e.g. `let fac = m.debounceFunction(m.request, 200, true)`. Even you can use string as `m.debounce` does.
2. there is a little cache, if you pass the same factory, wait and immediate, you will get the same function, this is useful when you want to get a same function with same memory address. For example:

```
let fun = () => {}
let fun1 = m.debounceFunction(fun, 200)
let fun2 = m.debounceFunction(fun, 200)
let fun3 = m.debounceFunction(fun, 300)

fun1 === fun2 // true
fun2 == fun3 // false
```

A practic case is `m.on(event, handler, order, debounce)`, you can read the source code to understand the usage.

## Generator

This component is generated by [componer](https://github.com/tangshuang/componer).
If you want to modify the source code, do like this:

```
# install componer
npm i -g componer
# create a project
mkdir my-project && cd my-project && componer init
# get from registry
componer clone {{componout-name}} -u https://github.com/{{author-name}}/{{componout-name}}.git
# install dependencies
componout install
# preview this component
componout preview {{componout-name}}
```

To learn more about componer, read [this](https://github.com/tangshuang/componer).

*Notice: component is not a application, or a plugin, if you want someone to use your component, you do not need to build it into another moduleType, just provide source code. Who wanting to use your component should build his application with your component.*
