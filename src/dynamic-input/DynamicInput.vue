<template>
  <!--custom component-->
  <div v-if="descriptor.type === 'custom'">
    <slot
      :name="descriptor.slotName || 'field$'+field"
      :value="_value"
      :setValue="setValue"
    />
  </div>
  <!--dynamic component which already register-->
  <component
    :is="_name"
    v-else-if="!isSpecialType||(descriptor.component && descriptor.component.name)"
    v-model="_value"
    class="dynamic-input"
    v-bind="_bind"
    :size="size"
    v-on="_on"
  >
    <dynamic-component v-for="(component, index) in _children" :key="index" :component="component" />
  </component>
  <!-- enum type use el-select -->
  <el-select
    v-else-if="descriptor.type === 'enum'"
    v-model="_value"
    class="dynamic-input"
    v-bind="_bind"
    :class="{'multi-select': descriptor.multiple}"
    :size="size"
    :multiple="descriptor.multiple"
    v-on="_on"
  >
    <el-option
      v-for="option in _options"
      :key="option.label"
      :value="option.value"
      :label="option.label"
      :disabled="option.disabled"
    />
  </el-select>
  <!-- date type use el-date-picker -->
  <el-date-picker
    v-else-if="descriptor.type === 'date'"
    v-model="_value"
    class="dynamic-input"
    type="datetime"
    v-bind="_bind"
    :size="size"
    v-on="_on"
  />
</template>

<script>
import DynamicComponent from '../dynamic-component/DynamicComponent.vue'

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

export default {
  name: 'DynamicInput',
  componentName: 'dynamic-input',
  components: {
    DynamicComponent
  },
  props: {
    value: {
      type: [String, Number, Boolean, Array, Object, Date, Function, Symbol],
      required: true
    },
    /**
     * json's field
     */
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
  },
  data () {
    return {}
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
    _name () {
      if (!this.descriptor.component || !this.descriptor.component.name) {
        return TYPE_COMPONENT_MAP[this.descriptor.type] || 'el-input'
      } else {
        return this.descriptor.component.name
      }
    },
    _options () {
      if (this.descriptor.enum || this.descriptor.options) {
        const data = this.descriptor.options instanceof Array ? this.descriptor.options : this.descriptor.enum
        return data.map(item => {
          if (typeof item === 'object') {
            return item
          } else {
            return { label: item, value: item }
          }
        })
      } else {
        return []
      }
    },
    _bind () {
      const data = {};
      /**
       * Compatible with the version <= 2.2.0
       * These props is the first level props of descriptor in old version
       */
      ['disabled', 'placeholder', 'autocomplete'].forEach(key => {
        if (typeof this.descriptor[key] !== 'undefined') {
          data[key] = this.descriptor[key]
        }
      })
      const props = this.descriptor.component && this.descriptor.component.props
        ? this.descriptor.component.props
        : this.descriptor.props
      return Object.assign(data, props)
    },
    _on (e) {
      return this.descriptor.component && this.descriptor.component.events
        ? this.descriptor.component.events
        : (this.descriptor.events || {})
    },
    _children () {
      if (!this.descriptor.component) {
        return []
      }
      if (Array.isArray(this.descriptor.component.children)) {
        return this.descriptor.component.children
      }
      if (typeof this.descriptor.component.children === 'string') {
        return [this.descriptor.component.children]
      }
      return []
    },
    isSpecialType () {
      return ['enum', 'date'].includes(this.descriptor.type)
    }
  },
  created () {
  },
  methods: {
    setValue (value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="scss" scoped>
.dynamic-input {
  width: calc(100% - 60px);
}

.multi-select {
  width: calc(100% - 60px);
}
</style>
