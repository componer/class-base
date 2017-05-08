var copyProperty = (Target, Source) => {
    Reflect.ownKeys(Source).forEach(key => {
        if(key !== 'constructor' && key !== 'prototype' && key !== 'name') {
            let descriptor = Object.getOwnPropertyDescriptor(Source, key)
            Object.defineProperty(Target, key, descriptor)
        }
    })
}

export default class MixClass {
    /**
     * @desc mix this class with other classes, this class property will never be overwrite, the final output class contains certain property and all of this class's property
     * @param Classes: the classes passed to mix, previous class will NOT be overwrite by the behind ones.
     */
    static mixin(...Classes) {
        class MixedClass {}

        Classes.reverse()
        Classes.push(this)
        Classes.forEach(Mixin => {
            copyProperty(MixedClass, Mixin)
            copyProperty(MixedClass.prototype, Mixin.prototype)
        })

        return MixedClass
    }

    /**
     * @desc mix other classes into this class, property may be overwrite by passed class, behind class will cover previous class
     */
    static mixto(...Classes) {
        class MixedClass {}

        Classes.unshift(this)
        for(let Mixin of Classes) {
            copyProperty(MixedClass, Mixin)
            copyProperty(MixedClass.prototype, Mixin.prototype)
        }

        return MixedClass
    }
}
