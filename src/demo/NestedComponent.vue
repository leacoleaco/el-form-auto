<template>
    <div style="padding: 5px">
        <div> use can nested the lea-auto-form component in sub-component, and auto validate: </div>
        <lea-auto-form
                :model-value="props.modelValue"
                :descriptors="descriptors"/>
    </div>
</template>

<script>
import LeaAutoForm from '@/lea-auto-form/Form.vue'

export default {
  name: 'NestedComponent',
  components: { LeaAutoForm }
}
</script>

<script setup>
import {reactive, defineProps} from 'vue'

const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    }
})

const descriptors = {
    age: {
        type: 'number',
        label: 'age',
        rules: [
            {required: true, message: 'age is required', trigger: 'blur'},
        ],
    },
}

</script>

<style scoped>

</style>
