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
        <el-button @click="descriptors.enum1.options=['a','b','c']" size="small" style="margin-top:10px">
          set_enum_options
        </el-button>

        <el-button @click=" Object.keys(data).map(key => { delete data[key] })" size="small"
                   style="margin-top:10px">
          clearData
        </el-button>
      </el-col>
      <el-col :span="15">
        <div style="color:blueviolet">the form will auto generate by the descriptor we input:
          <el-select v-model="switchLayout" placeholder="select layout">
            <el-option label="Default Layout" value=""></el-option>
            <el-option label="Row Layout" value="row"></el-option>
            <el-option label="Tab Layout" value="tab"></el-option>
          </el-select>
        </div>
        <div style="padding: 20px;margin-top:10px;background: #efefef">
          <lea-auto-form
              ref="refAutoForm"
              :descriptors="descriptors"
              v-model="data"
              :enum-source="enumSource"
              :default-parent-component="parentComponent"
              :default-parent-component-props="parentLayoutProps"
              :default-item-component="defaultItemComponent"
              :default-item-component-props="defaultItemComponentProps"
          >

            <!--use custom component -->
            <template #field$custom1="{value,setValue,data,placeholder, parentValue, parentDescriptor}">
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
            <template #customSlotName="{value,setValue,data, placeholder, parentValue, parentDescriptor}">
              <div>
                custom2: {{ value }}
              </div>
              <el-time-select
                  :model-value="value"
                  @update:modelValue="setValue"
                  :picker-options="{ start: '08:30', step: '00:15', end: '18:30' }"
                  :placeholder="placeholder">
              </el-time-select>
            </template>

            <!--use custom slot name for custom component-->
            <template #field$custom3="{value,setValue,data, placeholder, parentValue, parentDescriptor}">
              <custom-component
                  :model-value="value"
                  @update:modelValue="setValue"
              >
              </custom-component>
            </template>

            <template #nestedSlotName="{value,setValue,data, placeholder, parentValue, parentDescriptor}">
              <div>
                <div>nested data: {{ value }}</div>
                <div>parent value: {{ parentValue }}</div>
                <nested-component
                    :model-value="value"
                    @update:modelValue="setValue"/>
              </div>
            </template>

            <template #customWrapSlot="{value,setValue,data, placeholder, parentValue, parentDescriptor}">
              <div style="color: #999999">
                <div>custom template in wrap field</div>
                <div>current value is: {{ value }}</div>
                <el-input type="text"
                          :model-value="value"
                          @update:modelValue="setValue"
                />
              </div>
            </template>

            <template #addOnTemplate="{value,setValue,settings,data, placeholder, parentValue, parentDescriptor}">
              <div style="border: solid 1px #d2d2d2; padding:3px 5px;background: #eef2f3">
                <div>
                  This is a add on template,
                  we can use it to add some extra content to the form item:
                </div>
                <div> current template value: {{ value }}</div>
                <div> current template settings : {{ settings }}</div>
              </div>
            </template>

            <template #alertMessage="{value,settings,data, placeholder, parentValue, parentDescriptor}">
              <AsyncTextComponent :url="settings.url"/>
            </template>
          </lea-auto-form>
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
import LeaAutoForm from '../lea-auto-form/Form.vue'
import CustomComponent from './CustomComponent.vue'
import NestedComponent from './NestedComponent.vue'
import { ElMessage, ElRow, ElCol, ElTimeSelect, ElInput, ElButton, ElSelect, ElOption } from 'element-plus'

export default {
  name: 'Demo',
  components: {
    CustomComponent,
    NestedComponent,
    LeaAutoForm,
    ElRow,
    ElCol,
    ElTimeSelect,
    ElInput,
    ElButton,
    ElSelect,
    ElOption
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
import {ref, reactive, watch} from "vue";
import {ElSwitch, ElRow, ElCol, ElTabs, ElTabPane, ElTable, ElTableColumn} from "element-plus";
import LeaAutoFormTableLayout from '../lea-auto-form/TableLayout.vue'
import cascaderOptions from './data/CascaderOptions.js'
import AsyncTextComponent from './AsyncTextComponent.vue'

const data = ref({
  number2: 99,
  number3: "xxx",
  list1: [{text1: 'I am an array item1'}],
  list2: [{text1: 'I am an array item2'}],
  wrap1: {
    text1: "test"
  }
})

const enumSource = ref({
  "testKey": ['Sun', 'Moon', 'Star']
})

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
  number2: {
    type: 'number',
    label: 'SetFromData',
    defaultValue: 6,
    tooltip: {
      content: "This is tooltip"
    },
  },
  number3: {
    type: 'number',
    label: 'SetFromWrongData',
    defaultValue: 6,
    alert: {
      showIcon: true,
      closable: true,
      type: 'info',
      message: 'This is an alert box,  <span style="color:orange">with html</span>',
    }
  },
  number4: {
    type: 'number',
    label: 'complex alert',
    alert: {
      showIcon: true,
      closable: true,
      type: 'info',
      messageSlot: "alertMessage",
      props: {
        url: 'https://v1.hitokoto.cn/?c=f&encode=text'
      }
    }
  },
  slider1: {
    type: 'slider',
    // use props to override default behavior
    props: {
      min: 1,
      max: 360,
      step: 2,
    },
    defaultValue: 2
  },
  boolean1: {
    type: 'boolean',
    defaultValue: true
  },
  booleanReact: {
    type: 'string',
    hidden: true,
    dependOnProp: 'boolean1',
    placeholder: 'I\'ll show when boolean1 is checked'
  },
  booleanReactRevert: {
    type: 'number',
    hidden: true,
    dependOnProp: 'boolean1',
    dependOnPropRevert: true,
    placeholder: 'I\'ll show when boolean1 is not checked'
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
  enumFromSource: {
    type: 'enum',
    label: 'TestEnumFromSource',
    enumSourceKey: 'testKey',
    placeholder: 'Please choose'
  },
  checkbox1: {
    type: 'enum',
    label: 'Checkbox',
    multiple: true,
    enumComponent: 'checkbox',
    options: [
      {label: 'Orange', value: 0},
      {label: 'Banana', value: 1},
      {label: 'Apple', value: 2}
    ],
    placeholder: 'Please choose some fruits'
  },
  radio1: {
    type: 'enum',
    label: 'Radio',
    enumComponent: 'radio',
    options: [
      {label: 'Orange', value: 0},
      {label: 'Banana', value: 1},
      {label: 'Apple', value: 2}
    ],
    placeholder: 'Please choose some fruits'
  },
  cascader1: {
    type: 'enum',
    enumComponent: 'cascader',
    options: cascaderOptions,
  },
  date1: {
    type: 'date'
  },
  color1: {
    type: 'color'
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
  nested1: {
    type: 'custom',
    slotName: 'nestedSlotName',
    defaultValue: {}
  },

  list1: {
    type: 'array',
    label: 'Array Field',
    addButtonText: 'Custom Add Button Name',
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
          ],
          tooltip: {
            content: 'This is tooltip'
          }
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
        },
        list2: {
          type: 'array',
          label: 'Nested Array Field',
          defaultValue: [],
          itemDescriptor: {
            type: 'object',
            fields: {
              number6: {
                type: 'number',
                defaultValue: 2
              },
              nested2: {
                type: 'custom',
                slotName: 'nestedSlotName',
                defaultValue: {age: 18}
              },
            }
          }
        }
      }
    },
    addons: [{
      slotName: 'addOnTemplate',
      settings: [{
        settingA: 'i am add on setting for array'
      }]
    }]
  },
  list2: {
    type: 'array',
    label: 'Table Array',
    addButtonText: 'Custom Add Button Name',
    layoutComponent: LeaAutoFormTableLayout,
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
          ],
          tooltip: {
            content: 'This is tooltip'
          }
        },
        boolean2: {
          type: 'boolean',
          columnProps: {
            //property config you can  see:
            //https://element-plus.org/en-US/component/table.html#table-column-attributes
            width: '100px'
          },
          defaultValue: true
        },
        number1: {
          type: 'number',
          label: 'Number Field',
          columnProps: {
            //property config you can  see:
            //https://element-plus.org/en-US/component/table.html#table-column-attributes
            width: '130px'
          },
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
        },
        list2: {
          type: 'array',
          label: 'Nested Array Field',
          defaultValue: [],
          itemDescriptor: {
            type: 'object',
            fields: {
              number6: {
                type: 'number',
                defaultValue: 2
              },
              nested2: {
                type: 'custom',
                slotName: 'nestedSlotName',
                defaultValue: {age: 18}
              },
            }
          }
        }
      }
    }
  },
  wrap1: {
    type: 'wrap',
    label: 'Wrap Field',
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
  },
  wrap2: {
    type: 'wrap',
    label: 'Wrap2 Field',
    labelPosition: 'top',
    fields: {
      text1: {
        type: 'text',
        label: 'Text Field',
        min: 1,
        defaultValue: '',
        component: {
          name: 'el-input', props: {type: 'textarea'}
        },
        rules: [{required: true, message: 'it is required!'}]
      },
      number2: {
        type: 'number',
        label: 'Long Long Label Name',
        defaultValue: 6,
        tooltip: {
          content: "This is tooltip"
        },
      },
      custom: {
        type: 'custom',
        slotName: 'customWrapSlot',
      }
    },
    addons: [{
      slotName: 'addOnTemplate',
      settings: [{
        settingA: 'i am add on setting for wrap'
      }]
    }]
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
    let newDescriptors = JSON.parse(myInputDescriptorConfig.value);
    Object.assign(descriptors, newDescriptors)
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

// layout control
const parentComponent = ref('div')
const parentLayoutProps = ref({})
const defaultItemComponent = ref('div')
const defaultItemComponentProps = ref({})

const switchLayout = ref("")

watch(switchLayout, (newVal) => {
  if (newVal === "row") {
    //you can use any parent component you want with binding component
    parentComponent.value = ElRow
    defaultItemComponent.value = ElCol
    parentLayoutProps.value = {
      col: 2
    }
    defaultItemComponentProps.value = {
      span: 12
    }
  } else if (newVal === 'tab') {
    //you can use any parent component you want with binding component
    parentComponent.value = ElTabs
    defaultItemComponent.value = ElTabPane
    parentLayoutProps.value = {
      type: 'border-card'
    }
    defaultItemComponentProps.value = function (key, value, descriptor) {
      return {
        label: descriptor.label || key
      }
    }
  } else {
    parentComponent.value = 'div'
    defaultItemComponent.value = 'div'
    parentLayoutProps.value = {}
    defaultItemComponentProps.value = {}
  }
})

// layout control end

</script>

<style scoped>

</style>
