<template>
    <el-form-item
            v-show="!descriptor.hidden"
            :ref="prop"
            :label="labelWidth === '0px' ? '' : (label || prop)"
            :label-width="labelWidth"
            :prop="prop"
            :required="descriptor.required"
            :rules="descriptor.rules||[]"
            :show-message="showOuterError || !isComplexDataType(descriptor.type) || Boolean(descriptor.component)"
            :size="size"
            class="form-item"
    >
        <!-- if type is custom slot type-->
        <div v-if="descriptor.type==='custom'">
            <slot
                    v-if="$slots[descriptor.slotName]"
                    :name="descriptor.slotName"
                    :value="value"
                    :setValue="updateValue"
                    :data="data"
                    :placeholder="descriptor.placeholder"
            />
            <slot
                    v-else
                    :name="'field$'+prop"
                    :value="value"
                    :setValue="updateValue"
                    :data="data"
                    :placeholder="descriptor.placeholder"
            />
        </div>
        <!--simple type -->
        <!--                v-model="value"-->
        <dynamic-input
                v-else-if="!isComplexDataType(descriptor.type) || Boolean(descriptor.component)"
                :model-value="props.modelValue"
                @update:modelValue="updateValue"
                :size="size"
                :field="prop"
                :descriptor="descriptor"
        />
        <!-- if type is array -->
        <template v-else-if="descriptor.type === 'array'">
            <div v-if="descriptor.itemDescriptor && descriptor.itemDescriptor.type === 'enum' && descriptor.itemDescriptor.multiple"
                class="multi-select"
            >
                <dynamic-input
                    :model-value="props.modelValue"
                    @update:modelValue="updateValue"
                    :size="size"
                    :descriptor="descriptor.itemDescriptor"
                />
            </div>
            <div v-else class="sub-dynamic-form array" :style="{backgroundColor: subFormBackgroundColor}">
                <form-item
                        v-for="(temp, key) in value"
                        :key="key"
                        v-model="value[key]"
                        :data="data"
                        :prop="prop ? prop + '.' + key : key"
                        :deletable="true"
                        :descriptor="descriptor.itemDescriptor"
                        label-width="0px"
                        :background-color="subFormBackgroundColor"
                        :show-outer-error="showOuterError"
                        @delete="deleteItem(key)"
                        @fieldInput="e=>$emit('fieldInput',e)"
                >
                    <!--pass the parent's slots to child component-->
                    <template
                            v-for="(_ , name) in $slots"
                            v-slot:[name]="data"
                    >
                        <slot :name="name" v-bind="data"/>
                    </template>
                </form-item>
                <div class="add-key-input-group">
                    <el-button type="primary" icon="el-icon-plus" :size="size" plain @click="addArrayItem">
                        {{ descriptor.addButtonText || 'add' }}
                    </el-button>
                </div>
            </div>
        </template>
        <!-- if type is object or hashmap -->
        <template v-else-if="descriptor.type === 'object'">
            <!-- normal object with known keys -->
            <div
                    v-if="!descriptor.itemDescriptor"
                    class="sub-dynamic-form"
                    :style="{backgroundColor: subFormBackgroundColor}"
            >
                <form-item
                        v-for="(_descriptor, key) in descriptor.fields"
                        :key="key"
                        v-model="value[key]"
                        :data="data"
                        :label="_descriptor.label || key"
                        :prop="prop ? prop + '.' + key : key"
                        :descriptor="_descriptor"
                        :label-width="getLabelWidth(descriptor.fields, fontSize)"
                        :background-color="subFormBackgroundColor"
                        :show-outer-error="showOuterError"
                        @fieldInput="e=>$emit('fieldInput',e)"
                >
                    <!--pass the parent's slots to child component-->
                    <template
                            v-for="(_ , name) in $slots"
                            v-slot:[name]="data"
                    >
                        <slot :name="name" v-bind="data"/>
                    </template>
                </form-item>
            </div>
            <!-- hashmap object -->
            <div
                    v-else
                    class="sub-dynamic-form hashmap"
                    :style="{backgroundColor: subFormBackgroundColor}"
            >
                <form-item
                        v-for="key in value"
                        :ref="prop + '.' + key"
                        :key="key"
                        v-model="value[key]"
                        :data="data"
                        :label="key"
                        :prop="prop ? prop + '.' + key : key"
                        :deletable="true"
                        :descriptor="descriptor.itemDescriptor"
                        :label-width="getLabelWidth(value, fontSize)"
                        :background-color="subFormBackgroundColor"
                        :show-outer-error="showOuterError"
                        @delete="deleteKey(key)"
                        @input="e=>$emit('fieldInput',e)"
                >
                    <!--pass the parent's slots to child component-->
                    <template
                            v-for="(_ , name) in $slots"
                            v-slot:[name]="data"
                    >
                        <slot :name="name" v-bind="data"/>
                    </template>
                </form-item>
                <el-form-item>
                    <div class="add-key-input-group">
                        <el-input v-model="hashMapKey" :placeholder="descriptor.mapKeyPlaceHolder || 'key name'"
                                  :size="size"/>
                        <el-button
                                type="primary"
                                icon="el-icon-plus"
                                :size="size"
                                :disabled="!hashMapKey || value[hashMapKey] !== undefined"
                                plain
                                @click="addHashMapKey"
                        >
                            {{ descriptor.addButtonText || 'add' }}
                        </el-button>
                    </div>
                </el-form-item>
            </div>
        </template>
        <el-button v-if="deletable" class="delete-button" link icon="el-icon-close" @click="emitDelete"/>
    </el-form-item>
</template>

<script>
import DynamicInput from '../dynamic-input/DynamicInput.vue'

export default {
  name: 'FormItem',
  components: {
    DynamicInput
  }
}
</script>

<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {createDescriptorRefData, darkenColor, fixValue, getLabelWidth, isComplexDataType} from "@/util/utils";

const hashMapKey = ref('')

const emit = defineEmits(['update:modelValue', 'fieldInput', 'delete'])

const props = defineProps({
    modelValue: {
        required: true
    },
    /**
     * the data's field
     */
    prop: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    /**
     * descriptor of binding data
     * ```javascript
     * {
     *  type:''           , //the data's type.  include: string,number,boolean,array,object,date,custom
     *  label:''          , // the data's label
     *  defaultValue:     , // the data's default value, if target is undefine, we use this value instead
     *  rules:            , // the form's validate rule, see:  https://github.com/yiminghe/async-validator
     *  itemDescriptor:{} , // if the type is array or object, we can use this field to descripte the item
     *  addButtonText:''  , // if the type is array, edit this to change the add button's text
     *  slotName:''       , // if the type is custom, we may use slot to change the component, otherwise ,the name should be 'field$xxxx',
     * }
     * ```
     *
     */
    descriptor: {
        type: Object,
        required: true
    },
    /**
     * the form's binding data
     */
    data: {
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
     * font-size of form
     */
    fontSize: {
        type: Number,
        default: 14
    },
    /**
     * background-color of form
     */
    backgroundColor: {
        type: String,
        default: '#FFFFFF'
    },
    /**
     * darken sub-form's background-color with offset if got positive integer
     */
    bgColorOffset: {
        type: Number,
        default: 8
    },
    /**
     * whether show parent component's error, default true
     */
    showOuterError: {
        type: Boolean,
        default: true
    },
    deletable: {
        type: Boolean,
        default: false
    },
    labelWidth: {
        type: String,
        default: '30px'
    },
    /**
     * wether open validate
     */
    doValidate: {
        type: Boolean,
        default: false
    }
})

// console.assert(props.modelValue !== undefined, `绑定 ${props.prop} 时, modelValue 不能为undefined`)

const value = props.modelValue

function updateValue(v) {
    // value.value = v
    console.log("formItem",v)
    emit('update:modelValue', v)
    emit('fieldInput', {
        prop: props.prop,
        descriptor: props.descriptor,
        value: v
    })
}

const subFormBackgroundColor = computed(() => {
    return props.bgColorOffset
        ? darkenColor(props.backgroundColor, props.bgColorOffset)
        : 'none'
})

watch(
    () => props.hashMapKey,
    (val) => {
        if (val.indexOf('.') !== -1) {
            hashMapKey.value = hashMapKey.value.replace(/\./g, '')
        }
    }
)

// watch(
//     () => props.modelValue,
//     (v) => {
//         if(value){
//             value = fixValue(v, props.descriptor)
//         }
//     }
// )

function clearValidate() {
    this.$refs[props.prop].clearValidate()
}

function resetField() {
    this.$refs[props.prop].resetField()
}

function addHashMapKey() {
    value[hashMapKey.value] = createDescriptorRefData(
        props.descriptor.itemDescriptor
    )
    hashMapKey.value = ''
    this.$refs[props.prop].resetField()
}

function addArrayItem() {
    const item = createDescriptorRefData(props.descriptor.itemDescriptor)
    value.push(item)
}

function emitDelete() {
    emit('delete')
}

function deleteKey(key) {
    delete value[key]
}

function deleteItem(index) {
    value.splice(index, 1)
}

function validateCustomComponent() {
    const promises = []
    const validateFuns = this.travelTreeValidateFun(this)
    if (validateFuns && validateFuns.length) {
        for (let fun of validateFuns) {
            const r = fun()
            if (r instanceof Promise) {
                promises.push(r)
            }
        }
    }
    return Promise.all(promises).then((r) => r.indexOf(false) === -1)
}

function travelTreeValidateFun(root) {
    let res = []
    if (!res) return res
    let queue = [root]
    while (queue.length) {
        let node = queue.pop()
        if (node.auto$ValidateForm) {
            res.push(node.auto$ValidateForm)
        }
        if (node.$children) {
            for (let c of node.$children) {
                queue.unshift(c)
            }
        }
    }
    return res
}

</script>

<style lang="scss" scoped>
.sub-dynamic-form {
  border-radius: 5px;
  padding: 10px;

  .el-form-item:last-child {
    margin-bottom: 0;
  }
}

.add-key-input-group {
  display: flex;
  margin-top: 10px;

  .el-input {
    width: 250px;
    margin-right: 10px;
  }
}

.add-key-input-group:first-child {
  margin-top: 0;
}

.delete-button {
  position: absolute;
  top: 0;
  right: 5px;
  font-size: 20px;
  color: #F56C6C;
  padding: 5px 0;
}

.delete-button:hover {
  color: red;
}

.dynamic-input + .delete-button {
  top: auto;
  right: auto;
}
</style>
