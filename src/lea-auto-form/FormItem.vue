<template>
  <!--  :ref="prop"-->
  <el-form-item
      v-show="calcShow"
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
    <template v-if="descriptor.type==='custom'">
      <slot
          v-if="$slots[descriptor.slotName]"
          :name="descriptor.slotName"
          :value="props.modelValue"
          :setValue="updateValue"
          :modelValue="props.modelValue"
          :updateModelValue="updateValue"
          :data="data"
          :prop="prop"
          :placeholder="descriptor.placeholder"
          :descriptor="descriptor"
          :parentValue="parentValue"
          :parentDescriptor="parentDescriptor"
      />
      <slot
          v-else
          :name="'field$'+prop"
          :value="props.modelValue"
          :setValue="updateValue"
          :modelValue="props.modelValue"
          :updateModelValue="updateValue"
          :data="data"
          :prop="prop"
          :placeholder="descriptor.placeholder"
          :descriptor="descriptor"
          :parentValue="parentValue"
          :parentDescriptor="parentDescriptor"
      />
    </template>
    <!--simple type -->
    <dynamic-input
        v-else-if="!isComplexDataType(descriptor.type) || Boolean(descriptor.component)"
        :model-value="props.modelValue"
        @update:modelValue="updateValue"
        :enum-source="enumSource"
        :size="size"
        :field="prop"
        :descriptor="descriptor"
    />
    <!-- if type is array -->
    <template v-else-if="descriptor.type === 'array'">
      <component
          v-if="descriptor.itemDescriptor && descriptor.itemDescriptor.type === 'enum' && descriptor.itemDescriptor.multiple"
          :is="descriptor.component || 'div'"
          class="multi-select"
      >
        <dynamic-input
            :model-value="props.modelValue"
            @update:modelValue="updateValue"
            :enum-source="enumSource"
            :size="size"
            :descriptor="descriptor.itemDescriptor"
        />
      </component>
      <component v-else class="sub-dynamic-form array"
                 :is="descriptor.component || 'div'"
                 :style="{backgroundColor: subFormBackgroundColor}">

        <!--layout component, like TableLayout.vue etc.-->
        <!--notice: here is the collection's layout, so the data is a array-->
        <component v-if="descriptor.layoutComponent"
                   :is="descriptor.layoutComponent"
                   v-model="props.modelValue"
                   :data="data"
                   :enum-source="enumSource"
                   :prop="prop"
                   :descriptor="descriptor.itemDescriptor"
                   :parent-descriptor="parentDescriptor"
                   :parent-value="parentValue"
        >
          <!--pass the parent's slots to child component-->
          <template
              v-for="(_ , name) in $slots"
              v-slot:[name]="data"
          >
            <slot :name="name" v-bind="data"/>
          </template>
        </component>
        <div v-else>
          <!--notice: here is the item's layout, node collection's layout, so the data is the object-->
          <form-item
              v-for="(temp, key) in props.modelValue"
              :key="temp"
              v-model="props.modelValue[key]"
              :data="data"
              :enum-source="enumSource"
              :prop="prop ? prop + '.' + key : key"
              :deletable="true"
              :descriptor="descriptor.itemDescriptor"

              :parent-descriptor="descriptor"
              :parent-value="props.modelValue"

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
        </div>
        <component
            :is="descriptor.addButtonComponent || 'div'"
            class="add-key-input-group">
          <el-button class="addButton" type="primary" :icon="plus" :size="size" plain @click="addArrayItem">
            <add-icon class="icon"/>
            {{ descriptor.addButtonText || 'add' }}
          </el-button>
        </component>
      </component>

      <!--add on , to display extra content behind form items-->
      <template v-if="descriptor.addons">
        <slot v-for="(addon,p) in descriptor.addons"
              :key="p"
              :name="addon.slotName"
              :settings="addon.settings"
              :value="props.modelValue"
              :setValue="updateValue"
              :modelValue="props.modelValue"
              :updateModelValue="updateValue"
              :data="data"
              :prop="prop"
              :placeholder="descriptor.placeholder"
              :descriptor="descriptor"
              :parentValue="parentValue"
              :parentDescriptor="parentDescriptor"
        />
      </template>

    </template>
    <!-- if type is wrap -->
    <template v-else-if="descriptor.type === 'wrap'">
      <div class="sub-dynamic-form el-form"
           :class="{
            'el-form--label-top':descriptor.labelPosition==='top',
            'el-form--label-right':descriptor.labelPosition==='right',
           }"
           :style="{backgroundColor: subFormBackgroundColor}">
        <form-item
            v-for="(subDesc, key) in descriptor['fields']"
            :key="key"
            v-model="props.modelValue[key]"
            :data="data"
            :enum-source="enumSource"
            :label="subDesc.label || key"
            :prop="`${prop}.${key}`"
            :descriptor="subDesc"
            :parent-descriptor="parentDescriptor"
            :parent-value="props.modelValue"
            :background-color="subFormBackgroundColor"
            :show-outer-error="showOuterError"
        >
          <!--pass the parent's slots to child component-->
          <template
              v-for="(_ , name) in $slots"
              v-slot:[name]="data"
          >
            <slot :name="name" v-bind="data"/>
          </template>
        </form-item>

        <!--add on, in order to display some extra info behind the wrap form-->
        <template v-if="descriptor.addons">
          <slot v-for="(addon,p) in descriptor.addons"
                :key="p"
                :name="addon.slotName"
                :settings="addon.settings"
                :value="props.modelValue"
                :setValue="updateValue"
                :modelValue="props.modelValue"
                :updateModelValue="updateValue"
                :data="data"
                :prop="prop"
                :placeholder="descriptor.placeholder"
                :descriptor="descriptor"
                :parentValue="parentValue"
                :parentDescriptor="parentDescriptor"
          />
        </template>
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
            v-model="props.modelValue[key]"
            :data="data"
            :enum-source="enumSource"
            :label="_descriptor.label || key"
            :prop="prop ? prop + '.' + key : key"
            :descriptor="_descriptor"
            :parent-descriptor="descriptor"
            :parent-value="props.modelValue"
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
            v-for="key in props.modelValue"
            :ref="prop + '.' + key"
            :key="key"
            v-model="props.modelValue[key]"
            :data="data"
            :enum-source="enumSource"
            :label="key"
            :prop="prop ? prop + '.' + key : key"
            :deletable="true"
            :descriptor="descriptor.itemDescriptor"
            :parent-descriptor="descriptor"
            :parent-value="props.modelValue"
            :label-width="getLabelWidth(props.modelValue, fontSize)"
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
                class="addButton"
                type="primary"
                :size="size"
                :disabled="!hashMapKey || props.modelValue[hashMapKey] !== undefined"
                plain
                @click="addHashMapKey"
            >
              <add-icon class="icon"/>
              {{ descriptor.addButtonText || 'add' }}
            </el-button>
          </div>
        </el-form-item>
      </div>
    </template>
    <el-button v-if="deletable" class="delete-button" link @click="emitDelete">
      <close-icon class="icon"/>
    </el-button>
    <el-alert
        v-if="descriptor.alert"
        v-bind="descriptor.alert"
        style="margin: 3px 8px 0 0">
      <slot
          :name="descriptor.alert?.messageSlot"
          :value="props.modelValue"
          :settings="descriptor.alert?.props"
          :data="data"
          :prop="prop"
          :placeholder="descriptor.placeholder"
          :descriptor="descriptor"
          :parentValue="parentValue"
          :parentDescriptor="parentDescriptor"
      >
        <div v-html="descriptor.alert?.message"/>
      </slot>
    </el-alert>
  </el-form-item>
</template>

<script>
import { ElAlert, ElButton, ElFormItem, ElInput } from 'element-plus'

import DynamicInput from '../dynamic-input/DynamicInput.vue'

export default {
  name: 'LeaAutoFormItem',
  components: {
    DynamicInput,
    ElButton,
    ElFormItem,
    ElInput,
    ElAlert
  }
}
</script>

<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {
  createDescriptorRefData,
  darkenColor,
  makeRefValueFromDescriptor,
  getLabelWidth,
  isComplexDataType
} from "../util/utils";

import AddIcon from "../components/AddIcon.vue";
import CloseIcon from "../components/CloseIcon.vue";

const hashMapKey = ref('')

const emit = defineEmits(['update:modelValue', 'fieldInput', 'delete'])

const props = defineProps({
  modelValue: {
    required: true
  },
  /**
   * the data's field
   * if field is wrap, use "a.b" to let framework detect prop
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
   * the form's global binding data
   */
  data: {
    type: Object,
    required: true
  },

  /**
   * get parent's value if in wrap or array
   */
  parentValue: {
    type: [Object, Array],
    default: undefined
  },
  /**
   * get parent's descriptor if in wrap or array
   */
  parentDescriptor: {
    type: Object,
    default: undefined
  },

  /**
   * the form's global enumSource
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
    default: undefined
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
    default: ''
  },
  /**
   * wether open validate
   */
  doValidate: {
    type: Boolean,
    default: false
  }
})

function updateValue(v) {
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

const calcShow = computed(() => {
  if (props.descriptor.dependOnProp) {
    if (!props.descriptor.dependOnPropRevert) {
      return props.data[props.descriptor.dependOnProp]
    } else {
      return !props.data[props.descriptor.dependOnProp]
    }
  }
  return !props.descriptor.hidden
})

function addHashMapKey() {
  props.modelValue[hashMapKey.value] = createDescriptorRefData(
      props.descriptor.itemDescriptor
  )
  hashMapKey.value = ''
  this.$refs[props.prop].resetField()
}

function addArrayItem() {
  const item = createDescriptorRefData(props.descriptor.itemDescriptor)
  if (props.modelValue === undefined) {
    emit('update:modelValue', [item])
  } else {
    props.modelValue.push(item)
  }
}

function emitDelete() {
  emit('delete')
}

function deleteKey(key) {
  delete props.modelValue[key]
}

function deleteItem(index) {
  props.modelValue.splice(index, 1)
}
</script>

<style lang="scss" scoped>
.sub-dynamic-form {
  border-radius: 5px;
  width: 100%;
  margin: 3px 5px 3px 0px;
  padding: 10px;

  .el-form-item:last-child {
    margin-bottom: 0px;
  }
}

.el-form-item .el-form-item {
  margin-bottom: 8px;
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
  top: -8px;
  right: -2px;
  font-size: 20px;
  color: #F56C6C;
  padding: 5px 0;

  .icon {
    color: #F56C6C;
    width: 15px;
    height: 15px;
  }
}

.addButton {
  .icon {
    width: 13px;
    height: 13px;
  }
}

.delete-button:hover {
  color: red;
}

.dynamic-input + .delete-button {
  top: auto;
  right: auto;
}

</style>
