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
            <form-item
                    ref="refFormItems"
                    v-for="(descriptor, key) in descriptors"
                    :key="key"
                    :model-value="value[key]"
                    @update:modelValue="updateValue(key, $event)"
                    :data="value"
                    :lang="lang"
                    :label="descriptor.label || key"
                    :prop="key"
                    :label-width="labelWidth"
                    :descriptor="descriptor"
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
        </el-form>
    </div>
</template>

<script>
import { ElForm, ElFormItem } from 'element-plus'
import FormItem from '@/lea-auto-form/FormItem.vue'

export default {
  name: 'LeaAutoForm',
  components: {
    FormItem,
    ElForm,
    ElFormItem
  },
  methods: {}

}
</script>

<script setup>
import {isComplexDataType, getLabelWidth, fixValue} from '../util/utils'
import {ref, isRef, isReactive, watch, computed, reactive, provide, inject, onMounted} from 'vue'

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
    }
})

// const emit = defineEmits(['update:modelValue', 'fieldInput'])

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
// const value = computed({
//     get: () => props.modelValue,
//     set: (value) => emit('update:modelValue', value)
// })

function updateValue(prop, v) {
    value[prop] = v
    // emit('update:modelValue', v)
}

const rules = computed(() => {
    const r = {}
    for (const prop in props.descriptors) {
        const rules = props.descriptors[prop].rules
        if (rules) {
            r[prop] = rules
        }
    }
    return r
})

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
    if (!isRef(value) && !isReactive(value)) {
        throw Error(`auto form's value is not reacctive, you need use ref() or reactive()`)
    }
    for (const key in props.descriptors) {
        setValueKey(value, key, props.descriptors[key])
    }
}

function setValueKey(refValue, fieldKey, descriptor) {
    if (!isRef(refValue) && !isReactive(refValue)) {
        throw Error(`${fieldKey} 's value is not reacctive, you need use ref() or reactive()`)
    }
    const refValueElement = refValue[fieldKey]
    if (isComplexDataType(descriptor.type)) {
        if (descriptor.type === 'object') {
            // object
            if (descriptor.fields) {
                // normal object
                if (refValueElement === undefined) {
                    refValue[fieldKey] = reactive({})
                }
                for (const subFieldKey in descriptor.fields) {
                    setValueKey(refValueElement, subFieldKey, descriptor.fields[subFieldKey])
                }
                return
            } else {
                // hashmap
                if (refValueElement === undefined) {
                    refValue[fieldKey] = reactive({})
                    return
                }
            }
        } else {
            // array
            if (refValueElement === undefined) {
                refValue[fieldKey] = reactive([])
                return
            }
        }
    } else if (descriptor.type === 'array') {
        if (refValueElement === undefined) {
            refValue[fieldKey] = ref([])
        }
    }

    if (refValueElement === null) {
        refValue[fieldKey] = reactive(null)
        return
    }

    refValue[fieldKey] = fixValue(undefined, descriptor)
}

init()

/**
 * validate form and the children nested form
 * @returns {Promise<boolean>}
 */
function validate() {
    let promises = [validateCurrentForm, ...provideAutoValidationForm.value].map(it => it())
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
    const promises = []
    promises.push(new Promise((resolve, reject) => {
        refForm.value.validate(valid => {
            resolve(valid)
        })
    }))
    // validate form in slot
    for (let refFormItem of refFormItems.value) {
        promises.push(refFormItem.validateCustomComponent())
    }
    // correct if all valid
    return Promise.all(promises).then(r => r.indexOf(false) === -1)
}

/**
 * validate form provide
 * to inject into the sub form, which can be validated by the parent form
 * see prop: disableValidateChildrenForm
 * @returns {Promise<boolean>}
 */
const provideAutoValidationForm = ref([]);
// () => Promise.resolve(true)
provide('leaAutoValidationForm', provideAutoValidationForm);

if (!props.disableValidateChildrenForm) {
    onMounted(() => {
        //inject auto validation
        const injectAutoValidationForm = inject('leaAutoValidationForm')
        if (injectAutoValidationForm) {
            injectAutoValidationForm.value.push(validateCurrentForm)
        }
    })
}

function resetFields() {
    refForm.value.resetFields()
}

function clearValidate() {
    refForm.value.clearValidate()
}

defineExpose({
    validate,
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