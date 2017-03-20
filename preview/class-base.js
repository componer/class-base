import ClassBase from '../src/class-base'

console.log('%cDemo1: getter and setter', 'font-size: 1.5em;color: blue')
var a = new ClassBase()
a.set('name', 'tom')
a.set('book.type', 'Novel')
a.set('book.amount', 15)
console.log(a.get('name'), a.get('book'))

console.log('%cDemo2: setter trigger', 'font-size: 1.5em;color: blue')
var b = new ClassBase()
b.on('change:name', name => console.log('Name is ' + name))
b.set('name', 'miki')

console.log('%cDemo3: bind events and trigger events', 'font-size: 1.5em;color: blue')
var c = new ClassBase()
c.on('happen', () => console.log('Some thing happens.'))
c.on('change:book.name', name => console.log('Book name has changed to ' + name))
c.trigger('happen')
c.off('happen')
c.trigger('happen')
c.set('book.name', 'New York')

console.log('%cDemo4: mixin', 'font-size: 1.5em;color: blue')
class A {
    sing() {
        console.log('Hello, Hello, How are you.')
    }
}
class B {
    sing() {
        console.log('Happy new year!')
    }
}
var C = ClassBase.mixin(A, B) // use previous
var d = new C()
d.sing()
var E = ClassBase.mixto(A, B) // use behind
var f = new E()
f.sing()
