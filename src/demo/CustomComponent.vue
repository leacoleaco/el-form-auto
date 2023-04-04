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
import {defineProps, defineEmits, defineExpose, ref, watch} from 'vue'

const props = defineProps({
    value: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['input'])

const text = ref(props.value)
const hasErr = ref(false)
const error = ref('')

watch(() => text, (v) => {
    text.value = v
})

function auto$ValidateForm() {
    // defind this method，The el-auto-form will auto call it~
    const _this = this
    return new Promise(function (resolve, reject) {
        const valid = _this.text === 'rico'
        if (!valid) {
            _this.hasErr = true
            _this.error = 'you need to input "rico"'
        } else {
            _this.hasErr = false
            _this.error = ''
        }
        resolve(valid)
    })
}

function onChange(e) {
    emit('input', e.target.value)
}

defineExpose({
    auto$ValidateForm
})
</script>

<style scoped>

</style>
