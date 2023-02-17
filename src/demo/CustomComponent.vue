<template>
  <div :style="{
   border:hasErr?'solid 1px orangered':'solid 1px #eeeeee'
  }"
       style="padding: 5px"
  >
    <div>
      use custom component validate example:
    </div>
    <input v-model="text" type="text" @input="onChange">&nbsp;
    <span v-if="error" style="color:orangered">{{ error }}</span>
  </div>
</template>

<script>
export default {
  name: 'CustomComponent',
  props: {
    value: { type: String, required: true }
  },
  created () {
    this.text = this.value
  },
  data () {
    return {
      text: '',
      hasErr: false,
      error: ''
    }
  },
  watch: {
    text (v) {
      this.$emit('input', v)
    }
  },
  methods: {
    auto$ValidateForm () {
      // defind this method，The el-auto-form will auto call it~
      const _this = this
      return new Promise(function (resolve, reject) {
        const valid = _this.text === 'rico'
        if (!valid) {
          _this.hasErr = true
          _this.error = 'you need to input "rico"'
        } else {
          _this.hasErr = false
          _this.error = ''
        }
        resolve(valid)
      })
    },
    onChange (e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>

<style scoped>

</style>
