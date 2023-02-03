<template>
  <component
    :is="component.name"
    v-if="typeof component !== 'string'"
    v-bind="component.props"
    v-on="component.events"
  >
    <dynamic-component v-for="(item, index) in children" :key="index" :component="item" />
  </component>
  <span v-else>{{ component }}</span>
</template>

<script>
export default {
  name: 'DynamicComponent',
  componentName: 'dynamic-component',
  components: {},
  props: {
    component: {
      type: [Object, String],
      required: true
    }
  },
  data () {
    return {}
  },
  computed: {
    children () {
      if (!this.component.children) {
        return []
      }
      if (typeof this.component.children === 'string') {
        return [this.component.children]
      }
      if (Array.isArray(this.component.children)) {
        return this.component.children
      }
      return []
    }
  },
  created () {},
  methods: {}
}
</script>

<style lang="scss" scoped>
</style>
