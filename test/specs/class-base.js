import ClassBase from '../../src/class-base'

describe('Class Base', () => {
    let instance = null
    beforeEach(() => instance = new ClassBase())
    afterEach(() => instance = null)

    describe('getter and setter', () => {
        it('most normal use set => get', () => {
            instance.set('name', 'instance')
            expect(instance.get('name')).toBe('instance')
        })

        it('use tree structure', () => {
            instance.set('svg.width', 800)
            expect(instance.get('svg')).toBeTruthy() // svg object is exists
            expect(instance.get('svg.width')).toBe(800)
        })

        it('set trigger event', () => {
            let flag = 0
            instance.on('change:data', () => flag = 1)
            instance.set('data.name', 'new name')
            expect(flag).toBe(1)
        })

        it('set trigger depth', () => {
            let flag = 0
            instance.on('change:data.name', () => flag = 1)
            instance.set('data.name.readonly', true)
            expect(flag).toBe(1)
        })
    })

    describe('call', () => {
        it('test call a function', () => {
            let flag = 0
            let change = () => flag = 1

            instance.call(change)
            expect(flag).toBe(1)
        })

        it('test using this in function', () => {
            function change(name) {
                this.set('change-data', name) // using this
            }
            instance.call(change, 'carry')
            expect(instance.get('change-data')).toBe('carry')
        })
    })

    describe('events on and trigger and off', () => {
        it('on', () => {
            let flag = 0
            instance.on('change:on', () => flag = 1)
            instance.set('on', 'my event')
            expect(flag).toBe(1)
        })

        it('trigger', () => {
            let flag = 0
            instance.on('trigger', () => flag = 1)
            instance.trigger('trigger')
            expect(flag).toBe(1)
        })

        it('off', () => {
            let flag = 0
            let fun = () => flag = 1
            instance.on('off', fun)
            instance.off('off', fun) // remove it
            instance.trigger('off')
            expect(flag).toBe(0)
        })

        it('event order', () => {
            let flag = 0
            let fun1 = () => flag = 1
            let fun2 = () => flag = 2

            instance.on('order', fun1, 45)
            instance.on('order', fun2, 12)

            instance.trigger('order')
            // fun2 run before fun1, so flag will be 1

            expect(flag).toBe(1)
        })
    })

    describe('mix', () => {
        it('mixin', () => {
            class A {
                toString() {
                    return 'A'
                }
            }
            class B {
                toString() {
                    return 'B'
                }
            }

            let NewClass = ClassBase.mixin(A, B)
            let a = new NewClass()
            expect(a.toString()).toBe('[class ClassBaseMix]')
        })

        it('mixto', () => {
            class C {
                toString() {
                    return 'C'
                }
            }
            class D {
                toString() {
                    return 'D'
                }
            }
            let NewClass = ClassBase.mixto(C, D)
            let c = new NewClass()
            expect(c.toString()).toBe('D')
        })

        it('extends mixed class', () => {
            class F {}
            class G {}
            class NewClass extends ClassBase.mixin(F, G) {}
            let i = new NewClass()
            expect(i.toString()).toBe('[class NewClass]')
        })
    })
})
