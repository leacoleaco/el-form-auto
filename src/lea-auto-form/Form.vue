<template>
  <div class="form" :style="style">
    <el-form
        v-if="value"
        ref="refForm"
        style="background: none"
        :model="value"
        :disabled="disabled"
        :size="size"
        :label-position="labelPosition"
    >
      <component :is="defaultParentComponent" v-bind="defaultParentComponentProps">
        <component
            :is="defaultItemComponent||descriptors.layout"
            v-bind="defaultItemComponentProps||descriptors.layoutProps"
            v-for="(descriptor, key) in descriptors"
            :key="key">
          <form-item
              ref="refFormItems"
              :model-value="value[key]"
              @update:modelValue="updateValue(key, $event)"
              :data="value"
              :enum-source="enumSource"
              :lang="lang"
              :label="descriptor.label || key"
              :prop="key"
              :label-width="labelWidth"
              :descriptor="descriptor"
              :parent-descriptor="descriptors"
              :parent-value="modelValue"
              :size="size"
              :background-color="backgroundColor"
              :bg-color-offset="bgColorOffset"
              :show-outer-error="showOuterError"
              @fieldInput="e=>$emit('fieldInput',e)"
          >
            <!--pass the parent's slots to child component-->
            <template
                v-for="(_, name) in $slots" v-slot:[name]="data"
            >
              <slot :name="name" v-bind="data"/>
            </template>
          </form-item>

          <el-form-item v-if="$slots.operations" class="operations" :label-width="labelWidth">
            <slot name="operations"/>
          </el-form-item>

        </component>
      </component>
    </el-form>
  </div>
</template>

<script>
import { ElForm, ElFormItem } from 'element-plus'
import FormItem from './FormItem.vue'
import { providePublicRegister, publicRegisterInstance } from './regist-util'

export default {
  name: 'LeaAutoForm',
  components: {
    FormItem,
    ElForm,
    ElFormItem
  },
  methods: {},
  publicRegisterInstance,
  providePublicRegister
}

</script>

<script setup>
import {isComplexDataType, getLabelWidth, makeRefValueFromDescriptor} from '../util/utils'
import {
  ref,
  isRef,
  isReactive,
  watch,
  computed,
  reactive,
  getCurrentInstance
} from 'vue'
import {provideRegister, publicRegisterInstance, registerInstance} from "./regist-util";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  lang: {
    type: String,
    default: 'zh_CN'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * descriptor of data
   */
  descriptors: {
    type: Object,
    required: true
  },
  /**
   * if you don't want to use enum options in the descriptors,
   * you can provide global enum options here,
   * then set the 'enumSourceKey' in descriptor
   */
  enumSource: {
    type: Object,
    default: {}
  },
  /**
   * size of the input component
   */
  size: {
    type: String,
    default: 'small'
  },
  /**
   * show label position
   * [top, left ,right]
   */
  labelPosition: {
    type: String,
    default: 'right'
  },
  /**
   * background-color of form
   */
  backgroundColor: {
    type: String,
    default: '#FFFFFF'
  },
  /**
   * font-size of form
   */
  fontSize: {
    type: Number,
    default: 13
  },
  /**
   * whether show parent component's error, default true
   */
  showOuterError: {
    type: Boolean,
    default: true
  },
  /**
   * darken sub-form's background-color with offset while get positive integer
   */
  bgColorOffset: {
    type: Number,
    default: 8
  },
  /**
   * disable auto validate children form if true
   */
  disableValidateChildrenForm: {
    type: Boolean,
    default: false
  },
  defaultParentComponent: {
    type: [String, Object],
    default: 'div'
  },
  defaultParentComponentProps: {
    type: Object,
    default: {}
  },
  defaultItemComponent: {
    type: [String, Object],
    default: 'div'
  },
  defaultItemComponentProps: {
    type: Object,
    default: {}
  }
})

const doValidate = ref(false)

const refForm = ref(null)
const refFormItems = ref([])

watch(
    () => props.descriptors,
    () => {
      init()
    }
)

const value = props.modelValue

function updateValue(prop, v) {
  value[prop] = v
}

const labelWidth = computed(() => getLabelWidth(props.descriptors, props.fontSize))

const style = computed(() => {
  return {
    fontSize: `${props.fontSize}px`,
    backgroundColor: props.backgroundColor
  }
})

function init() {
  initValue()
}

function initValue() {
  if (value && !isRef(value) && !isReactive(value)) {
    throw Error(`auto form's value is not reacctive, you need use ref() or reactive()`)
  }
  if (!isRef(value) && !isReactive(value)) {
    throw Error(`value is not reacctive, you need use ref() or reactive()`)
  }
  for (const key in props.descriptors) {
    setValueKey(value, key, props.descriptors[key])
  }
}

function setValueKey(refValue, fieldKey, descriptor) {
  if (descriptor === undefined || descriptor === null) {
    console.warn(`field ${fieldKey} 's descriptor is undefined or null `)
    return
  }

  refValue[fieldKey] = makeRefValueFromDescriptor(refValue[fieldKey], descriptor)
}

init()

/**
 * validate form and the children nested form
 * @returns {Promise<boolean>}
 */
function validate() {
  const promises = []
  promises.push(validateCurrentForm())
  childLeaAutoForms.value.forEach(f => {
    if (f && f.exposed && f.exposed.validateCurrentForm) {
      promises.push(f.exposed.validateCurrentForm())
    }
  })
  return Promise.all(promises).then(r => {
    return r.indexOf(false) === -1
  })
}

/**
 * only validate current form, without nested form
 * @returns {Promise<boolean>}
 */
function validateCurrentForm() {
  // validate main form
  return new Promise((resolve, reject) => {
    if (refForm.value) {
      refForm.value.validate(valid => {
        resolve(valid)
      })
    } else {
      resolve(true)
    }
  })
}

/**
 * collect the children form's component
 * in order to can be validated by the parent form
 * see prop: disableValidateChildrenForm
 * @returns {Promise<boolean>}
 */
const childLeaAutoForms = ref([]);
provideRegister(childLeaAutoForms)

const instance = getCurrentInstance()

//inject regist
if (!props.disableValidateChildrenForm) {
  registerInstance(instance)
}

publicRegisterInstance(instance)

function resetFields() {
  refForm.value.resetFields()
}

function clearValidate() {
  refForm.value.clearValidate()
}

defineExpose({
  validate,
  validateCurrentForm,
  resetFields,
  clearValidate
})
</script>

<style lang="scss">
// cover element's css avoid the nested error style
.form {
  background: none;

  .el-form-item.is-success, .add-key-input-group {
    .el-input__inner,
    .el-input__inner:focus,
    .el-textarea__inner,
    .el-textarea__inner:focus {
      border-color: #DCDFE6;
    }
  }
}
</style>
