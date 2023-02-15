<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="15">
        <el-form-auto
            ref="autoForm"
            :descriptors="descriptors" v-model="data">

          <!--use custom component -->
          <template #field$custom1="{value,setValue,data,placeholder}">
            <div>we can write custom component here~ just use slot name 'field$'+prop name</div>
            <div>you can get current field value: <i>{{ value }}</i></div>
            <div>you also could get data, example: <i>{{ data.number1 }}</i></div>
            <div>get/binding placeholder here: example: <i>{{ placeholder }}</i></div>
          </template>

          <!--use custom slot name for custom component-->
          <template #customSlotName="{value,setValue,data, placeholder}">
            <el-time-select
                :value="value"
                @input="setValue"
                :picker-options="{ start: '08:30', step: '00:15', end: '18:30' }"
                :placeholder="placeholder">
            </el-time-select>
          </template>
        </el-form-auto>
        <el-button @click="validate" type="primary">validate</el-button>
        <el-button @click="clearValidate">clearValidate</el-button>
        <el-button @click="resetFields">resetFields</el-button>
      </el-col>
      <el-col :span="8">
        <div>BindingData is:</div>
        <pre>{{ JSON.stringify(data, null, 1) }}</pre>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import ElFormAuto from '@/el-form-auto/Form.vue'

export default {
  name: 'Demo',
  components: { ElFormAuto },
  data () {
    return {
      data: {
        number2: 99,
        list1: [{
          text1: 'I am an array item'
        }]
      },
      descriptors: {
        field_str: {
          type: 'string',
          label: 'String Field',
          placeholder: 'input string placeholder test',
          rules: [{
            type: 'string',
            required: true,
            message: 'you need input string',
            trigger: 'blur'
          }]
        },
        number1: {
          type: 'number',
          defaultValue: 2
        },
        boolean1: {
          type: 'boolean',
          defaultValue: true
        },
        custom1: {
          type: 'custom',
          defaultValue: 'default value test',
          placeholder: 'i am placeholder'
        },
        custom2: {
          type: 'custom',
          slotName: 'customSlotName',
          placeholder: 'choose time',
          rules: [{ required: true, message: 'write custom component valid message here~ ' }]
        },
        list1: {
          type: 'array',
          label: 'Array Field',
          addButtonText: 'Custom Add Button Name',
          defaultValue: [],
          itemDescriptor: {
            type: 'object',
            fields: {
              text1: {
                type: 'text',
                label: 'Text Field',
                min: 1,
                defaultValue: '',
                component: {
                  name: 'el-input', props: { type: 'textarea' }
                },
                rules: [
                  { required: true, message: 'you need to input text' }
                ]
              },
              boolean2: {
                type: 'boolean',
                defaultValue: true
              },
              number1: {
                type: 'number',
                label: 'Number Field',
                defaultValue: 999,
                rules: [
                  { required: true },
                  {
                    type: 'number',
                    validator (rule, value, callback, source, options) {
                      return new Promise(function (resolve, reject) {
                        const errors = []
                        if (value <= 0) {
                          errors.push('number must greater than 0')
                        }
                        reject(errors)
                      })
                    }
                  }
                ]
              }
            }
          }
        },
        obj1: {
          type: 'object',
          label: 'Object Field',
          addButtonText: 'Custom Add Button Name',
          defaultValue: [],
          itemDescriptor: {
            type: 'object',
            fields: {
              text1: {
                type: 'text',
                label: 'Text Field',
                min: 1,
                defaultValue: '',
                component: {
                  name: 'el-input', props: { type: 'textarea' }
                }
              }
            }
          }
        }
      }
    }
  },
  methods: {
    validate () {
      this.$refs.autoForm.validate()
        .then((valid) => {
          if (valid) {
            this.$message({
              message: 'validate success',
              type: 'success'
            })
          } else {
            this.$message({
              message: 'validate fail',
              type: 'error'
            })
          }
        })
    },
    resetFields () {
      this.$refs.autoForm.resetFields()
    },
    clearValidate () {
      this.$refs.autoForm.clearValidate()
    }
  }

}
</script>

<style scoped>

</style>
