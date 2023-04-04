<template>
  <!--dynamic component which already register-->
    <component
            :is="name"
            v-if="!isSpecialType||(descriptor.component && descriptor.component.name)"
            :model-value="props.modelValue"
            @update:modelValue="updateValue"
            class="dynamic-input"
            v-bind="bind"
            :size="size"
            v-on="on"
    >
        <dynamic-component v-for="(component, index) in children"
                           :key="index" :component="component"/>
    </component>
  <!-- enum type use el-select -->
    <el-select
            v-else-if="descriptor.type === 'enum'"
            :model-value="props.modelValue"
            @update:modelValue="updateValue"
            class="dynamic-input"
            v-bind="bind"
            :class="{'multi-select': descriptor.multiple}"
            :size="size"
            :multiple="descriptor.multiple"
            v-on="on"
    >
        <el-option
                v-for="option in options"
                :key="option.label"
                :value="option.value"
                :label="option.label"
                :disabled="option.disabled"
        />
    </el-select>
  <!-- date type use el-date-picker -->
    <el-date-picker
            v-else-if="descriptor.type === 'date'"
            :model-value="props.modelValue"
            @update:modelValue="updateValue"
            class="dynamic-input"
            type="datetime"
            v-bind="bind"
            :size="size"
            v-on="on"
    />
</template>

<script>
import DynamicComponent from '../dynamic-component/DynamicComponent.vue'

export default {
  name: 'DynamicInput',
  components: {
    DynamicComponent
  }
}

</script>

<script setup>
import {defineComponent, computed, ref} from 'vue'

const TYPE_COMPONENT_MAP = {
    string: 'el-input',
    number: 'el-input-number',
    boolean: 'el-switch',
    regexp: 'el-input',
    integer: 'el-input-number',
    float: 'el-input-number',
    enum: 'el-select',
    url: 'el-input'
}

const props = defineProps({
    modelValue: {
        required: true
    },
    field: {
        type: String,
        required: true
    },
    size: {
        type: String,
        default: 'small'
    },
    descriptor: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (v) => {
    // value.value = value
    console.log('dynamicInput', v)
    emit('update:modelValue', v)
}

const name = computed(() => {
    if (!props.descriptor.component || !props.descriptor.component.name) {
        return TYPE_COMPONENT_MAP[props.descriptor.type] || 'el-input'
    } else {
        return props.descriptor.component.name
    }
})

const options = computed(() => {
    if (props.descriptor.enum || props.descriptor.options) {
        const data = props.descriptor.options instanceof Array ? props.descriptor.options : props.descriptor.enum
        return data.map(item => {
            if (typeof item === 'object') {
                return item
            } else {
                return {label: item, value: item}
            }
        })
    } else {
        return []
    }
})

const keys = ['disabled', 'placeholder', 'autocomplete']

const bind = computed(() => {
    const data = {}
    keys.forEach(key => {
        if (typeof props.descriptor[key] !== 'undefined') {
            data[key] = props.descriptor[key]
        }
    })
    const propsData = props.descriptor.component && props.descriptor.component.props
        ? props.descriptor.component.props
        : props.descriptor.props
    return Object.assign(data, propsData)
})

const on = computed(() => {
    return props.descriptor.component && props.descriptor.component.events
        ? props.descriptor.component.events
        : (props.descriptor.events || {})
})

const children = computed(() => {
    if (!props.descriptor.component) {
        return []
    }
    if (Array.isArray(props.descriptor.component.children)) {
        return props.descriptor.component.children
    }
    if (typeof props.descriptor.component.children === 'string') {
        return [props.descriptor.component.children]
    }
    return []
})

const isSpecialType = computed(() => {
    return ['enum', 'date'].includes(props.descriptor.type)
})

</script>

<style lang="scss" scoped>
.dynamic-input {
  width: calc(100% - 60px);
}

.multi-select {
  width: calc(100% - 60px);
}
</style>
