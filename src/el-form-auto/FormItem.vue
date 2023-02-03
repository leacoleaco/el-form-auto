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
    <!--simple type -->
    <dynamic-input
        v-if="!isComplexDataType(descriptor.type) || Boolean(descriptor.component)"
        v-model="_value"
        :size="size"
        :field="prop"
        :descriptor="descriptor"
    />
    <!-- if type is custom slot type-->
    <div v-else-if="descriptor.type==='custom'">
      <slot
          v-if="$scopedSlots[descriptor.slotName]"
          :name="descriptor.slotName"
          :value="_value"
          :setValue="setValue"
      />
      <slot
          v-else
          :name="'field$'+prop"
          :value="_value"
          :setValue="setValue"
      />
    </div>
    <!-- if type is array -->
    <template v-else-if="descriptor.type === 'array'">
      <div
          v-if="descriptor.itemDescriptor && descriptor.itemDescriptor.type === 'enum' && descriptor.itemDescriptor.multiple"
          class="multi-select"
      >
        <dynamic-input
            v-model="_value"
            :size="size"
            :descriptor="descriptor.itemDescriptor"
        />
      </div>
      <div v-else class="sub-dynamic-form array" :style="{backgroundColor: subFormBackgroundColor}">
        <form-item
            v-for="(temp, key) in _value"
            :key="key"
            v-model="_value[key]"
            :prop="prop ? prop + '.' + key : key"
            :deletable="true"
            :descriptor="descriptor.itemDescriptor"
            label-width="0px"
            :background-color="subFormBackgroundColor"
            :show-outer-error="showOuterError"
            @delete="deleteItem(key)"
        >
          <!--pass the parent's slots to child component-->
          <template
              v-for="(_ , name) in $scopedSlots"
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
            v-model="_value[key]"
            :label="_descriptor.label || key"
            :prop="prop ? prop + '.' + key : key"
            :descriptor="_descriptor"
            :label-width="getLabelWidth(descriptor.fields, fontSize)"
            :background-color="subFormBackgroundColor"
            :show-outer-error="showOuterError"
        >
          <!--pass the parent's slots to child component-->
          <template
              v-for="(_ , name) in $scopedSlots"
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
            v-for="key in _value"
            :ref="prop + '.' + key"
            :key="key"
            v-model="_value[key]"
            :label="key"
            :prop="prop ? prop + '.' + key : key"
            :deletable="true"
            :descriptor="descriptor.itemDescriptor"
            :label-width="getLabelWidth(_value, fontSize)"
            :background-color="subFormBackgroundColor"
            :show-outer-error="showOuterError"
            @delete="deleteKey(key)"
        >
          <!--pass the parent's slots to child component-->
          <template
              v-for="(_ , name) in $scopedSlots"
              v-slot:[name]="data"
          >
            <slot :name="name" v-bind="data"/>
          </template>
        </form-item>
        <el-form-item>
          <div class="add-key-input-group">
            <el-input v-model="hashMapKey" :placeholder="descriptor.mapKeyPlaceHolder || 'key name'" :size="size"/>
            <el-button
                type="primary"
                icon="el-icon-plus"
                :size="size"
                :disabled="!hashMapKey || _value[hashMapKey] !== undefined"
                plain
                @click="addHashMapKey"
            >
              {{ descriptor.addButtonText || 'add' }}
            </el-button>
          </div>
        </el-form-item>
      </div>
    </template>
    <el-button v-if="deletable" class="delete-button" type="text" icon="el-icon-close" @click="emitDelete"/>
  </el-form-item>
</template>

<script>
import { isComplexDataType, getLabelWidth, darkenColor, createDescriptorRefData, fixValue } from '../util/utils'
import DynamicInput from '../dynamic-input/DynamicInput.vue'

export default {
  name: 'FormItem',
  components: {
    DynamicInput
  },
  props: {
    value: {
      type: [String, Number, Boolean, Array, Object, Date, Function, Symbol],
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
    }
  },
  data () {
    return {
      hashMapKey: '',
      fieldScopedSlots: null
    }
  },
  computed: {
    _value: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    },
    subFormBackgroundColor () {
      return this.bgColorOffset ? darkenColor(this.backgroundColor, this.bgColorOffset) : 'none'
    }
  },
  watch: {
    hashMapKey (val) {
      // el-form-item's prop not support "."
      if (val.indexOf('.') !== -1) {
        this.hashMapKey = this.hashMapKey.replace(/\./g, '')
      }
    }
  },
  created () {
    this._value = fixValue(this._value, this.descriptor)
  },
  mounted () {
    console.log('formItem:', this.$scopedSlots)
  },
  methods: {
    isComplexDataType,
    getLabelWidth,
    clearValidate () {
      this.$refs[this.prop].clearValidate()
    },
    resetField () {
      this.$refs[this.prop].resetField()
    },
    addHashMapKey () {
      this.$set(this._value, this.hashMapKey, createDescriptorRefData(this.descriptor.itemDescriptor))
      this.hashMapKey = ''
      this.$refs[this.prop].resetField() // reset field to clear validate status while adding fist hashmap key
    },
    addArrayItem () {
      const item = createDescriptorRefData(this.descriptor.itemDescriptor)
      this._value.push(item)
    },
    emitDelete () {
      this.$emit('delete')
    },
    deleteKey (key) {
      this.$delete(this._value, key)
    },
    deleteItem (index) {
      this._value.splice(index, 1)
    },
    setValue (value) {
      this._value = value
    }
  }
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
