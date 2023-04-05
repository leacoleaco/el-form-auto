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
import {defineProps, defineEmits, defineExpose, ref, watch, onMounted, inject} from 'vue'

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

function validateThis() {
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

onMounted(() => {
    //inject auto validation
    const injectAutoValidationForm = inject('leaAutoValidationForm')
    if (injectAutoValidationForm) {
        injectAutoValidationForm.value.push(validateThis)
    }
})

function onChange(e) {
    emit('update:modelValue', e.target.value)
}

</script>

<style scoped>

</style>
