<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="8">
        <div>With this descriptor:</div>
        <el-input type="textarea"
                  :rows="15"
                  v-model="myInputDescriptorConfig"
        ></el-input>
        <el-button @click="updateFormByMyInputDescriptorConfig" size="mini" style="margin-top:10px" type="warning">
          Regenerate Form
        </el-button>

        <div>and the form will auto binding to data:</div>
        <pre style="padding:20px;background: #efefef ">{{ JSON.stringify(data, null, 1) }}</pre>
      </el-col>
      <el-col :span="15">
        <div>the form will auto generate by the descriptor we input:</div>
        <div style="padding: 20px;background: #efefef">
          <el-form-auto
              ref="autoForm"
              :descriptors="descriptors" v-model="data">

            <!--use custom component -->
            <template #field$custom1="{value,setValue,data,placeholder}">
              <div>we can use slot name 'field$'+prop here to obtain a reference to the corresponding component.</div>
              <div>you can get current field value here: <i>{{ value }}</i></div>
              <div>But if you want to modify the bound value, you need to call the 'setValue' method to update it. (You
                can refer to the example of 'custom2' field, template named '#customSlotName')
              </div>
              <div>you can also get or binding global data here, example: <i>{{ data.number1 }}</i>&nbsp;&nbsp;<el-input-number
                  size="mini" v-model="data.number1"/>
              </div>
              <div>you can get or binding placeholder here: example: <i>{{ placeholder }}</i>&nbsp;&nbsp;
                <el-input size="mini" style="width:200px" :placeholder="placeholder"/>
              </div>
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

            <!--use custom slot name for custom component-->
            <template #field$custom3="{value,setValue,data, placeholder}">
              <custom-component
                  :value="value"
                  @input="setValue"
              >
              </custom-component>
            </template>

          </el-form-auto>
          <el-button @click="validate" type="primary">validate</el-button>
          <el-button @click="clearValidate">clearValidate</el-button>
          <el-button @click="resetFields">resetFields</el-button>
        </div>
      </el-col>
    </el-row>
    <a href="https://github.com/leacoleaco/el-form-auto" target="_blank" style="cursor: pointer">
      <img style="position: absolute; top: 0; right: 0; border: 0;"
           src="https://camo.githubusercontent.com/38ef81f8aca64bb9a64448d0d70f1308ef5341ab/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6461726b626c75655f3132313632312e706e67"
           alt="Fork me on GitHub"
           data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png"></a>
  </div>
</template>

<script>
import ElFormAuto from '@/el-form-auto/Form.vue'
import CustomComponent from '@/demo/CustomComponent.vue'

export default {
  name: 'Demo',
  components: { CustomComponent, ElFormAuto },
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
        enum1: {
          type: 'enum',
          options: ['Tiger', 'Lion', 'Eagle'],
          placeholder: 'Please choose an animal'
        },
        enum2: {
          type: 'enum',
          options: [
            { label: 'A', value: 0 },
            { label: 'B', value: 1 },
            { label: 'C', value: 2 }
          ],
          placeholder: 'Please choose a letter'
        },
        enum3: {
          type: 'enum',
          label: 'MultipleEnum',
          multiple: true,
          options: [
            { label: 'Orange', value: 0 },
            { label: 'Banana', value: 1 },
            { label: 'Apple', value: 2 }
          ],
          placeholder: 'Please choose some fruits'
        },
        date1: {
          type: 'date'
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
        custom3: {
          type: 'custom',
          defaultValue: 'July'
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
      },
      myInputDescriptorConfig: ''
    }
  },
  created () {
    this.myInputDescriptorConfig = JSON.stringify(this.descriptors, null, 2)
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
    },
    updateFormByMyInputDescriptorConfig () {
      try {
        this.descriptors = JSON.parse(this.myInputDescriptorConfig)
      } catch (e) {
        this.$message({
          message: 'descriptor config contain error! ' + e,
          type: 'error'
        })
      }
    }
  }

}
</script>

<style scoped>

</style>
