<template>
    <div :style="{
   border:hasErr?'solid 1px orangered':'solid 1px #eeeeee'
  }"
         style="padding: 5px"
    >
        <div>
            use custom component validate example:
        </div>
        <input v-model="text" link @input="onChange">&nbsp;
        <span v-if="error" style="color:orangered">{{ error }}</span>
    </div>
</template>

<script>
export default {
  name: 'CustomComponent'
}
</script>

<script setup>
import {defineProps, defineEmits, defineExpose, ref, watch, getCurrentInstance} from 'vue'
import {registerInstance} from "../lea-auto-form/regist-util";

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['input'])

const text = ref(props.modelValue)
const hasErr = ref(false)
const error = ref('')

watch(() => text, (v) => {
    text.value = v
})

const instance = getCurrentInstance()
registerInstance(instance)

function validateCurrentForm() {
    // defind this method，The el-auto-form will auto call it~
    return new Promise(function (resolve, reject) {
        const valid = text.value === 'rico'
        if (!valid) {
            hasErr.value = true
            error.value = 'you need to input "rico"'
        } else {
            hasErr.value = false
            error.value = ''
        }
        resolve(valid)
    })
}

defineExpose({
    validateCurrentForm
})

function onChange(e) {
    emit('update:modelValue', e.target.value)
}

</script>

<style scoped>

</style>
