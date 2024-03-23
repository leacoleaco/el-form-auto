<template>
  <!--dynamic component which already register-->
  <div style="display: flex;width: 100%">
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
      <dynamic-component v-for="component in children"
                         :key="component" :component="component"/>
    </component>
    <!-- enum type use el-select -->
    <el-select
        v-else-if="descriptor.type === 'enum'&&(!descriptor.enumComponent||descriptor.enumComponent==='select')"
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
          v-for="option in props.descriptor.enumSourceKey?props.enumSource[props.descriptor.enumSourceKey]:props.descriptor.options"
          :key="(typeof option ==='object')?option.label:option"
          :value="(typeof option ==='object')?option.value:option"
          :label="(typeof option ==='object')?option.label:option"
          :disabled="(typeof option==='object')?option.disabled:false"
      />
    </el-select>
    <el-checkbox-group
        v-else-if="descriptor.type === 'enum'&&(!descriptor.enumComponent||descriptor.enumComponent==='checkbox')"
        :model-value="props.modelValue"
        @update:modelValue="updateValue"
        class="dynamic-input"
        v-bind="bind"
        :class="{'multi-select': descriptor.multiple}"
        :size="size"
        :multiple="descriptor.multiple"
        v-on="on"
    >
      <el-checkbox
          v-for="option in props.descriptor.enumSourceKey?props.enumSource[props.descriptor.enumSourceKey]:props.descriptor.options"
          :key="(typeof option ==='object')?option.label:option"
          :value="(typeof option ==='object')?option.value:option"
          :label="(typeof option ==='object')?option.label:option"
          :disabled="(typeof option==='object')?option.disabled:false"
      />
    </el-checkbox-group>
    <el-radio-group
        v-else-if="descriptor.type === 'enum'&&(!descriptor.enumComponent||descriptor.enumComponent==='radio')"
        :model-value="props.modelValue"
        @update:modelValue="updateValue"
        class="dynamic-input"
        v-bind="bind"
        :size="size"
        v-on="on"
    >
      <el-radio
          v-for="option in props.descriptor.enumSourceKey?props.enumSource[props.descriptor.enumSourceKey]:props.descriptor.options"
          :key="(typeof option ==='object')?option.label:option"
          :value="(typeof option ==='object')?option.value:option"
          :label="(typeof option ==='object')?option.label:option"
          :disabled="(typeof option==='object')?option.disabled:false"
      />
    </el-radio-group>
    <!-- enum type use el-cascader -->
    <el-cascader
        v-else-if="descriptor.type === 'enum'&&descriptor.enumComponent==='cascader'"
        :model-value="props.modelValue"
        @update:modelValue="updateValue"
        class="dynamic-input"
        :options="props.descriptor.enumSourceKey?props.enumSource[props.descriptor.enumSourceKey]:props.descriptor.options"
        v-bind="bind"
        :size="size"
        v-on="on"
    />
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
    <!-- time type use el-date-picker -->
    <el-time-picker
        v-else-if="descriptor.type === 'time'"
        :model-value="props.modelValue"
        @update:modelValue="updateValue"
        class="dynamic-input"
        v-bind="bind"
        :size="size"
        v-on="on"
    />
    <el-time-picker
        v-else-if="descriptor.type === 'timeRange'"
        :model-value="props.modelValue"
        @update:modelValue="updateValue"
        class="dynamic-input"
        is-range
        v-bind="bind"
        :size="size"
        v-on="on"
    />
    <el-tooltip v-if="descriptor.tooltip" v-bind="descriptor.tooltip"
                style="margin-left:5px;"
    >
      <el-button text>
        <question-icon style="width: 15px;height: 15px"/>
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
import DynamicComponent from '../dynamic-component/DynamicComponent.vue'
import {
  ElButton,
  ElCascader,
  ElCheckbox,
  ElCheckboxGroup,
  ElColorPicker,
  ElDatePicker,
  ElInput,
  ElInputNumber,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElTimePicker,
  ElTooltip
} from 'element-plus'
import QuestionIcon from '../components/QuestionIcon.vue'

export default {
  name: 'DynamicInput',
  components: {
    DynamicComponent,
    ElButton,
    ElInput,
    ElInputNumber,
    ElSelect,
    ElOption,
    ElDatePicker,
    ElTimePicker,
    ElSwitch,
    ElSlider,
    ElCheckboxGroup,
    ElCheckbox,
    ElRadioGroup,
    ElRadio,
    ElCascader,
    ElColorPicker,
    ElTooltip,
    QuestionIcon
  }
}

</script>

<script setup>
import {defineProps, computed, ref} from 'vue'

const TYPE_COMPONENT_MAP = {
  string: 'el-input',
  number: 'el-input-number',
  boolean: 'el-switch',
  regexp: 'el-input',
  integer: 'el-input-number',
  float: 'el-input-number',
  enum: 'el-select',
  slider: 'el-slider',
  color: 'el-color-picker',
  url: 'el-input'
}

const props = defineProps({
  modelValue: {
    required: true
  },
  size: {
    type: String,
    default: 'small'
  },
  descriptor: {
    type: Object,
    required: true
  },
  enumSource: {
    type: Object,
    default: {}
  },
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (v) => {
  emit('update:modelValue', v)
}

const name = computed(() => {
  if (!props.descriptor.component || !props.descriptor.component.name) {
    return TYPE_COMPONENT_MAP[props.descriptor.type] || 'el-input'
  } else {
    return props.descriptor.component.name
  }
})

// const options = computed(() => {
//     if (props.descriptor.enum || props.descriptor.options) {
//         const data = props.descriptor.options instanceof Array ? props.descriptor.options : props.descriptor.enum
//         return data.map(item => {
//             if (typeof item === 'object') {
//                 return item
//             } else {
//                 return {label: item, value: item}
//             }
//         })
//     } else {
//         return []
//     }
// })

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
  return ['enum', 'date', 'time', 'timeRange'].includes(props.descriptor.type)
})

</script>

<style lang="scss" scoped>
.dynamic-input {
  width: calc(100% - 10px);
}

.multi-select {
  width: calc(100% - 10px);
}
</style>
