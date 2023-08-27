<script>
import { ElTable, ElTableColumn, ElButton } from 'element-plus'
import FormItem from '@/lea-auto-form/FormItem.vue'

export default {
  components: {
    ElTable, ElTableColumn, FormItem, ElButton
  }
}
</script>
<script setup>
import {defineProps} from 'vue'
import CloseIcon from "@/components/CloseIcon.vue";

const props = defineProps({
  modelValue: {
    required: true
  },
  /**
   * the data's field
   * if field is wrap, use "a.b" to let framework detect prop
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
   * descriptor of binding data
   * ```javascript
   * {
   *  type:''           , //the data's type.  include: string,number,boolean,array,object,date,custom
   *  label:''          , // the data's label
   *  defaultValue:     , // the data's default value, if target is undefine, we use this value instead
   *  rules:            , // the form's validate rule, see:  https://github.com/yiminghe/async-validator
   *  itemDescriptor:{} , // if the type is array or object, we can use this field to descripte the item
   *  addButtonText:''  , // if the type is array, edit this to change the add button's text
   *  slotName:''       , // if the type is custom, we may use slot to change the component, otherwise ,the name should be 'field$xxxx',
   * }
   * ```
   *
   */
  descriptor: {
    type: Object,
    required: true
  },
  /**
   * the form's global binding data
   */
  data: {
    type: Object,
    required: true
  },
  /**
   * get parent's value if in wrap or array
   */
  parentValue: {
    type: [Object, Array],
    default: undefined
  },
  /**
   * get parent's descriptor if in wrap or array
   */
  parentDescriptor: {
    type: Object,
    default: undefined
  },
  /**
   * the form's global enumSource
   */
  enumSource: {
    type: Object,
    default: {}
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
    default: ''
  },
  /**
   * wether open validate
   */
  doValidate: {
    type: Boolean,
    default: false
  }
})

function deleteItem(row) {
  let index = props.modelValue.indexOf(row);
  if (index !== -1) {
    props.modelValue.splice(index, 1);
  }
}

</script>

<template>
  <el-table :data="props.modelValue" :size="props.size"
            border
  >
    <el-table-column
        v-for="(_descriptor,key) in descriptor.fields"
        :key="key"
        v-bind="_descriptor.columnProps"
        :label="_descriptor.label || key"
    >
      <template #default="{row,column,$index}">
        <form-item
            v-model="row[key]"
            :data="data"
            :enum-source="enumSource"
            :prop="props.prop ? props.prop + '.' + $index+'.'+key : $index+'.'+key"
            :descriptor="_descriptor"
            label-width="0px"
            :background-color="props.backgroundColor"
            :show-outer-error="showOuterError"
            @fieldInput="e=>$emit('fieldInput',e)"
        >
          <!-- @delete="deleteItem(key)"-->
          <!--pass the parent's slots to child component-->
          <template
              v-for="(_ , name) in $slots"
              v-slot:[name]="data"
          >
            <slot :name="name" v-bind="data"/>
          </template>
        </form-item>
      </template>
    </el-table-column>
    <el-table-column width="60">
      <template #default="{row}">
        <el-button
            type="danger"
            class="delete-button" link
            @click="deleteItem(row)"
        >
          <close-icon class="icon"/>
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss">
.delete-button {
  font-size: 20px;
  color: #F56C6C;

  .icon {
    color: #F56C6C;
    width: 15px;
    height: 15px;
  }
}

.delete-button:hover {
  color: red;
}

</style>
