<template>
  <el-form-item
      v-show="!descriptor.hidden"
      :ref="prop"
      :label="labelWidth === '0px' ? '' : (label || prop)"
      :label-width="labelWidth"
      :prop="prop"
      :required="descriptor.required"
      :rules="descriptor.rules||[]"
      :show-message="showOuterError || !isObjOrArray(descriptor.type) || Boolean(descriptor.component)"
      :size="size"
      class="dynamic-form-item"
  >
    <!--simple type or custom type-->
    <dynamic-input
      v-if="!isObjOrArray(descriptor.type) || Boolean(descriptor.component)"
      v-model="_value"
      :size="size"
      :field="prop"
      :descriptor="descriptor"
    >
      <!--pass the parent's slots to child component-->
      <template
        v-for="(index, name) in transferSlots"
        v-slot:[name]="data"
      >
        <slot :name="name" v-bind="data" />
      </template>
    </dynamic-input>
    <!-- complex type, object or array -->
    <template v-else>
      <!-- normal object or hashmap object -->
      <template v-if="descriptor.type === 'object'">
        <!-- normal object with known keys -->
        <div
          v-if="!descriptor.defaultField"
          class="sub-dynamic-form"
          :style="{backgroundColor: subFormBackgroundColor}"
        >
          <dynamic-form-item
            v-for="(_descriptor, key) in descriptor.fields"
            :key="key"
            v-model="_value[key]"
            :label="_descriptor.label || key"
            :prop="prop ? prop + '.' + key : key"
            :descriptor="_descriptor"
            :label-width="getLabelWidth(descriptor.fields, fontSize)"
            :background-color="subFormBackgroundColor"
            :show-outer-error="showOuterError"
          />
        </div>
        <!-- hashmap object -->
        <div
          v-else
          class="sub-dynamic-form hashmap"
          :style="{backgroundColor: subFormBackgroundColor}"
        >
          <dynamic-form-item
            v-for="(temp, key) in _value"
            :ref="prop + '.' + key"
            :key="key"
            v-model="_value[key]"
            :label="key"
            :prop="prop ? prop + '.' + key : key"
            :deletable="true"
            :descriptor="descriptor.defaultField"
            :label-width="getLabelWidth(_value, fontSize)"
            :background-color="subFormBackgroundColor"
            :show-outer-error="showOuterError"
            @delete="deleteKey(key)"
          />
          <el-form-item>
            <div class="add-key-input-group">
              <el-input v-model="hashMapKey" :placeholder="descriptor.mapKeyPlaceHolder || 'key name'" :size="size" />
              <el-button
                type="primary"
                icon="el-icon-plus"
                :size="size"
                :disabled="!hashMapKey || _value[hashMapKey] !== undefined"
                plain
                @click="addHashMapKey"
              >
                {{ descriptor.addButtonText || 'add'}}
              </el-button>
            </div>
          </el-form-item>
        </div>
      </template>
      <!-- array -->
      <template v-else-if="descriptor.type === 'array'">
        <div
          v-if="descriptor.defaultField && descriptor.defaultField.type === 'enum' && descriptor.defaultField.multiple"
          class="multi-select"
        >
          <dynamic-input
            v-model="_value"
            :size="size"
            :descriptor="descriptor.defaultField"
          >
            <!--pass the parent's slots to child component-->
            <template
              v-for="(index, name) in transferSlots"
              v-slot:[name]="data"
            >
              <slot :name="name" v-bind="data" />
            </template>
          </dynamic-input>
        </div>
        <div v-else class="sub-dynamic-form array" :style="{backgroundColor: subFormBackgroundColor}">
          <dynamic-form-item
            v-for="(temp, key) in _value"
            :key="key"
            v-model="_value[key]"
            :prop="prop ? prop + '.' + key : key"
            :deletable="true"
            :descriptor="descriptor.defaultField"
            :language="language"
            label-width="0px"
            :background-color="subFormBackgroundColor"
            :show-outer-error="showOuterError"
            @delete="deleteItem(key)"
          />
          <div class="add-key-input-group">
            <el-button type="primary" icon="el-icon-plus" :size="size" plain @click="addArrayItem">
              {{ descriptor.addButtonText || 'add'}}
            </el-button>
          </div>
        </div>
      </template>
    </template>
    <el-button v-if="deletable" class="delete-button" type="text" icon="el-icon-close" @click="emitDelete" />
  </el-form-item>
</template>

<script>
import { isObjOrArray, getLabelWidth, darkenColor, createDescriptorRefData } from '../util/utils'
import DynamicInput from '../dynamic-input/DynamicInput.vue'

export default {
  name: 'DynamicFormItem',
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
     * descriptor of value, extend from https://github.com/yiminghe/async-validator
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
      hashMapKey: ''
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
    },
    transferSlots () {
      const r = {}
      for (const key in this.$scopedSlots) {
        if (key.startsWith('field$')) {
          r[key] = this.$scopedSlots[key]
        }
      }
      return r
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
  },
  methods: {
    isObjOrArray,
    getLabelWidth,
    clearValidate () {
      this.$refs[this.prop].clearValidate()
    },
    resetField () {
      this.$refs[this.prop].resetField()
    },
    addHashMapKey () {
      this.$set(this._value, this.hashMapKey, createDescriptorRefData(this.descriptor.defaultField))
      this.hashMapKey = ''
      this.$refs[this.prop].resetField() // reset field to clear validate status while adding fist hashmap key
    },
    addArrayItem () {
      this._value.push(createDescriptorRefData(this.descriptor.defaultField))
    },
    emitDelete () {
      this.$emit('delete')
    },
    deleteKey (key) {
      this.$delete(this._value, key)
    },
    deleteItem (index) {
      this._value.splice(index, 1)
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
