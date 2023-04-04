<template>
    <div>
        <el-row :gutter="10">
            <el-col :span="8">
                <div>With this descriptor:</div>
                <el-input type="textarea"
                          :rows="15"
                          v-model="myInputDescriptorConfig"
                ></el-input>
                <el-button @click="updateFormByMyInputDescriptorConfig" size="small" style="margin-top:10px"
                           type="warning">
                    Regenerate Form
                </el-button>

                <div>and the form will auto binding to data:</div>
                <pre style="padding:20px;background: #efefef ">{{ JSON.stringify(data, null, 1) }}</pre>

                <el-button @click="data.field_str='123'" size="small" style="margin-top:10px">
                    set_field_str
                </el-button>

                <el-button @click="data={}" size="small" style="margin-top:10px">
                    clearData
                </el-button>
            </el-col>
            <el-col :span="15">
                <div>the form will auto generate by the descriptor we input:</div>
                <div style="padding: 20px;background: #efefef">
                    <el-form-auto
                            ref="refAutoForm"
                            :descriptors="descriptors"
                            v-model="data"
                    >

                        <!--use custom component -->
                        <template #field$custom1="{value,setValue,data,placeholder}">
                            <div>we can use slot name 'field$'+prop here to obtain a reference to the corresponding
                                component.
                            </div>
                            <div>you can get current field value here: <i>{{ value }}</i></div>
                            <div>But if you want to modify the bound value, you need to call the 'setValue' method to
                                update it. (You
                                can refer to the example of 'custom2' field, template named '#customSlotName')
                            </div>
                            <div>you can also get or binding global data here, example: <i>{{ data.number1 }}</i>&nbsp;&nbsp;<el-input-number
                                    size="small" v-model="data.number1"/>
                            </div>
                            <div>you can get or binding placeholder here: example: <i>{{ placeholder }}</i>&nbsp;&nbsp;
                                <el-input size="small" style="width:200px" :placeholder="placeholder"/>
                            </div>
                        </template>

                        <!--use custom slot name for custom component-->
                        <template #customSlotName="{value,setValue,data, placeholder}">
                            {{value}}
                            <el-time-select
                                    :model-value="value"
                                    @update:modelValue="setValue"
                                    :picker-options="{ start: '08:30', step: '00:15', end: '18:30' }"
                                    :placeholder="placeholder">
                            </el-time-select>
                        </template>

                        <!--use custom slot name for custom component-->
                        <template #field$custom3="{value,setValue,data, placeholder}">
                            <custom-component
                                :model-value="value"
                                @update:modelValue="setValue"
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
import ElFormAuto from '@/le-auto-form/Form.vue'
import CustomComponent from '@/demo/CustomComponent.vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'Demo',
  components: { CustomComponent, ElFormAuto },
  data () {
    return {
      data: {
        number2: 99,
        list1: [{ text1: 'I am an array item1' }]
      }
    }
  },
  methods: {
    validate () {
      let refAutoForm = this.$refs.refAutoForm
      refAutoForm.validate().then(valid => {
        if (valid) {
          ElMessage.success({
            message: 'validate success'
          })
        } else {
          ElMessage.error({
            message: 'validate fail'
          })
        }
      })
    },
    resetFields () {
      this.$refs.refAutoForm.resetFields()
    },
    clearValidate () {
      this.$refs.refAutoForm.clearValidate()
    }
  }

}
</script>

<script setup>

import {ElMessage} from 'element-plus'
import {ref, reactive} from "vue";

// const data = reactive({
//     number2: 99,
//     list1: [{text1: 'I am an array item1'}],
// })

const descriptors = reactive({
    field_str: {
        type: 'string',
        label: 'String Field',
        placeholder: 'input string placeholder test',
        // Refer to the link https://github.com/yiminghe/async-validator for more rule usage examples.
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
            {label: 'A', value: 0},
            {label: 'B', value: 1},
            {label: 'C', value: 2}
        ],
        placeholder: 'Please choose a letter'
    },
    enum3: {
        type: 'enum',
        label: 'MultipleEnum',
        multiple: true,
        options: [
            {label: 'Orange', value: 0},
            {label: 'Banana', value: 1},
            {label: 'Apple', value: 2}
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
        rules: [{required: true, message: 'write custom component valid message here~ '}]
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
                        name: 'el-input', props: {type: 'textarea'}
                    },
                    rules: [
                        {required: true, message: 'you need to input text'}
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
                        {required: true},
                        {
                            type: 'number',
                            validator(rule, value, callback, source, options) {
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
                        name: 'el-input', props: {type: 'textarea'}
                    }
                }
            }
        }
    }
})

const myInputDescriptorConfig = ref({})

myInputDescriptorConfig.value = JSON.stringify(descriptors, null, 2)
function updateFormByMyInputDescriptorConfig() {
    try {
        descriptors.value = JSON.parse(myInputDescriptorConfig.value)
        ElMessage.success({
            message: 'regenerate finish! '
        })
    } catch (e) {
        console.error(e)
        ElMessage.error({
            message: 'descriptor config contain error! ' + e,
        })
    }
}

</script>

<style scoped>

</style>
