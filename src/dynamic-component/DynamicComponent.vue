<template>
    <component
            :is="component.name"
            v-if="typeof component !== 'string'"
            v-bind="component.props"
            v-on="component.events"
    >
        <dynamic-component v-for="item in children" :key="item" :component="item"/>
    </component>
    <span v-else>{{ component }}</span>
</template>

<script>
export default {
  name: 'DynamicComponent',
  componentName: 'dynamic-component'
}
</script>

<script setup>

import {computed} from "vue";

const props = defineProps({
    component: {
        type: [Object, String],
        required: true
    }
})

const children = computed(() => {
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
})

</script>

<style lang="scss" scoped>
</style>
