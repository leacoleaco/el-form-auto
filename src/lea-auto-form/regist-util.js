import { inject, onMounted, onUnmounted, provide } from 'vue'

export function provideRegister (childLeaAutoForms) {
  provide('registerLeaAutoForm', registerChild)

  function registerChild (component, regist) {
    if (regist) {
      childLeaAutoForms.value.push(component)
    } else {
      for (let i = 0; i < childLeaAutoForms.value.length; i++) {
        if (childLeaAutoForms.value[i].uid === component.uid) {
          childLeaAutoForms.value.splice(i, 1)
          break
        }
      }
    }
  }
}

export function registerInstance (instance) {
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
}

export function providePublicRegister (childLeaAutoForms) {
  provide('publicRegisterLeaAutoForm', registerChild)

  function registerChild (component, regist) {
    if (regist) {
      childLeaAutoForms.value.push(component)
    } else {
      for (let i = 0; i < childLeaAutoForms.value.length; i++) {
        if (childLeaAutoForms.value[i].uid === component.uid) {
          childLeaAutoForms.value.splice(i, 1)
          break
        }
      }
    }
  }
}

export function publicRegisterInstance (instance) {
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
  }
}
