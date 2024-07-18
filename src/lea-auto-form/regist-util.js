import {inject, onMounted, onUnmounted, provide} from 'vue'

export function provideRegister(childLeaAutoForms) {
    try {
        provide('registerLeaAutoForm', registerChild)
    } catch (e) {
        console.debug(e)
    }

    function registerChild(component, regist) {
        if (regist) {
            childLeaAutoForms.value.push(component)
            console.debug(`registerLeaAutoFormSuccess, total:${childLeaAutoForms.value.length}`, component)
        } else {
            for (let i = 0; i < childLeaAutoForms.value.length; i++) {
                if (childLeaAutoForms.value[i].uid === component.uid) {
                    childLeaAutoForms.value.splice(i, 1)
                    console.debug('unRegisterLeaAutoFormSuccess', component.uid)
                    break
                }
            }
        }
    }
}

export function registerInstance(instance) {
    if (!instance) {
        console.warn('registerInstance: instance is null, this instance auto validation may not work')
        return
    }
    try {
        const registMeFun = inject('registerLeaAutoForm')
        if (registMeFun) {
            onMounted(() => {
                if (typeof registMeFun === 'function') {
                    registMeFun(instance, true)
                }
            })
            onUnmounted(() => {
                if (typeof registMeFun === 'function') {
                    registMeFun(instance, false)
                }
            })
        }
    } catch (e) {
        console.debug(e)
    }
}

export function providePublicRegister(childLeaAutoForms) {
    provide('publicRegisterLeaAutoForm', registerChild)

    function registerChild(component, regist) {
        if (regist) {
            childLeaAutoForms.value.push(component)
            console.log(`registerLeaAutoFormSuccess total:${childLeaAutoForms.value.length}`, component)
        } else {
            for (let i = 0; i < childLeaAutoForms.value.length; i++) {
                if (childLeaAutoForms.value[i].uid === component.uid) {
                    childLeaAutoForms.value.splice(i, 1)
                    console.log('publicUnRegisterLeaAutoFormSuccess', component.uid)
                    break
                }
            }
        }
    }
}

export function publicRegisterInstance(instance) {
    if (!instance) {
        console.warn('publicRegisterInstance: instance is null, this instance auto validation may not work')
        return
    }
    try {
        const registMeFun = inject('publicRegisterLeaAutoForm')
        if (registMeFun) {
            onMounted(() => {
                if (typeof registMeFun === 'function') {
                    registMeFun(instance, true)
                }
            })
            onUnmounted(() => {
                if (typeof registMeFun === 'function') {
                    registMeFun(instance, false)
                }
            })
        } else {
            console.debug('can not found publicRegisterLeaAutoForm, this form auto validation may not work', instance)
        }
    } catch (e) {
        console.debug(e)
    }
}
