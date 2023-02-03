<template>
  <div class="form" :style="style">
    <el-form
        v-if="_value"
        ref="form"
        :model="_value"
        :disabled="disabled"
    >
      <form-item
          ref="formItem"
          v-for="(descriptor, key) in descriptors"
          :key="key"
          v-model="_value[key]"
          :lang="lang"
          :label="descriptor.label || key"
          :prop="key"
          :label-width="labelWidth"
          :descriptor="descriptor"
          :size="size"
          :background-color="backgroundColor"
          :bg-color-offset="bgColorOffset"
          :show-outer-error="showOuterError"
      >
        <!--pass the parent's slots to child component-->
        <template
            v-for="(_, name) in $scopedSlots"
            v-slot:[name]="data"
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
import { isComplexDataType, getLabelWidth } from '../util/utils'
import FormItem from './FormItem.vue'

export default {
  name: 'ElFormAuto',
  components: {
    FormItem
  },
  props: {
    value: {
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
    }
  },
  data () {
    return {
      doValidate: false
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
    rules () {
      const r = {}
      for (const prop in this.descriptors) {
        const rules = this.descriptors[prop].rules
        if (rules) {
          r[prop] = rules
        }
      }
      return r
    },
    labelWidth () {
      return getLabelWidth(this.descriptors, this.fontSize)
    },
    style () {
      const style = {
        fontSize: `${this.fontSize}px`,
        backgroundColor: this.backgroundColor
      }
      return style
    }
  },
  created () {
    this.init()
  },
  mounted () {
    console.log(this.$scopedSlots)
  },
  methods: {
    init () {
      this.initValue()
    },
    initValue () {
      for (const key in this.descriptors) {
        this.setValueKey(this, this._value, key, this.descriptors[key])
      }
    },
    setValueKey (target, value, key, descriptor) {
      if (isComplexDataType(descriptor.type)) {
        if (descriptor.type === 'object') {
          // object
          if (descriptor.fields) {
            // normal object
            if (value[key] === undefined) {
              target.$set(value, key, {})
            }
            for (const _key in descriptor.fields) {
              target.setValueKey(target, value[key], _key, descriptor.fields[_key])
            }
          } else {
            // hashmap
            if (value[key] === undefined) {
              target.$set(value, key, {})
            }
          }
        } else {
          // array
          if (value[key] === undefined) {
            target.$set(value, key, [])
          }
        }
      } else {
        if (value[key] === undefined) {
          target.$set(value, key, null)
        }
      }
    },
    validate () {
      // validate main form
      const promises = []
      promises.push(new Promise((resolve, reject) => {
        this.$refs.form.validate(valid => {
          resolve(valid)
        })
      }))
      // validate form in slot
      const formItems = this.$refs['formItem']
      for (let formItem of formItems) {
        promises.push(formItem.validateCustomComponent())
      }
      // correct if all valid
      return Promise.all(promises).then(r => r.indexOf(false) === -1)
    },
    resetFields () {
      this.$refs.form.resetFields()
    },
    clearValidate () {
      this.$refs.form.clearValidate()
    }
  }
}
</script>

<style lang="scss">
// cover element's css avoid the nested error style
.form {
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
