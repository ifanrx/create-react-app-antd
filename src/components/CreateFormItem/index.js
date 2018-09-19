import FileUpload from '../SchemaFileUpload'
import constants from '../../constants'
import React from 'react'
import util from '../../utils'
import {DatePicker, Form, Input, Select} from 'antd'
import cls from 'classnames'

const FormItem = Form.Item
const Option = Select.Option
const normalSchemaBuiltInFields = ['created_at', 'created_by', 'updated_at', 'id']

function formatLabel(str) {
  if (typeof str === 'string') {
    return <span title={str}>{util.textFormat(str, 10)}</span>
  } else {
    return str
  }
}

export default class CreateFormitem extends React.Component {
  get formItemLayout() {
    return this.props.formItemLayout || {
      labelCol: {
        xs: {span: 24},
        sm: {span: 4}
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 20}
      }
    }
  }

  get formItemLayoutWithOutLabel() {
    return this.props.formItemLayoutWithOutLabel || {
      labelCol: {
        xs: {span: 24},
        sm: {span: 0}
      },
      wrapperCol: {
        xs: {span: 24, offset: 0},
        sm: {span: 20, offset: 4}
      }
    }
  }

  /**
   * 根据表单域的数据类型获取对应的验证规则
   * @param type 类型
   */
  getTypeConfig = type => {
    type = type.toLowerCase()
    let fieldConfig = {
      integer: {pattern: /^(|-)\d+$/},
      number: {pattern: /^(|-)(\d+\.?\d+|\d+)$/},
      boolean: {pattern: /^(true|false)$/},
      string: {type}
    }
    return {...fieldConfig[type], message: `格式不正确，需要 ${type} 类型`}
  }

  /**
   * 根据表单域获取对应的双向绑定配置
   * @param item 表单域数据
   */
  getValidateConfig = item => {
    let config = {}
    if (item.name === 'created_at' || item.name === 'updated_at' || item.type === 'date') {
      config = {
        rules: [{type: 'object', message: '请选择时间'}]
      }
    } else if (item.name === 'created_by') {
      config = {rules: [{pattern: /^\d+$/, message: `${item.name} 格式不正确，（请输入用户 id）`}]}
    } else if (item.type === 'file') {
      config = {rules: [{validator: this.handleFileInput}]}
    } else {
      let rules = []
      item.type === 'array'
        ? rules.push(this.getTypeConfig(item.items.type.toLowerCase()))
        : rules.push(this.getTypeConfig(item.type.toLowerCase()))
      config = {rules}
    }
    if (item.constraints && item.constraints.required) {
      config.rules.push({required: true, message: `请输入 ${item.name}`})
    }
    return {...config}
  }

  handleProtectedFields = item => {
    let protectedFields = this.props.protectedFields || []
    let isBuildInSchema = this.props.isBuildInSchema !== undefined ? this.props.isBuildInSchema : false
    let fields = [...protectedFields, ...normalSchemaBuiltInFields]
    item.disabled = isBuildInSchema && fields.indexOf(item.name) !== -1
  }

  /**
   * 维护 uuid
   * @param arrName 数组名称
   */
  manipulateUid = arrName => {
    let {getFieldValue} = this.props.form
    let {uuid, setUuid} = this.props

    let keys = getFieldValue(`${arrName}keys`)
    if (keys.length > 0) {
      setUuid({...uuid, [arrName]: keys[keys.length - 1]})
      return
    }

    let newUuid = uuid[arrName] ? uuid[arrName] : 0
    setUuid({...uuid, [arrName]: newUuid})
  }

  renderOrdinaryForm = item => {
    let isDisabled = item.disabled
    if (item.type === 'boolean') {
      return (
        <Select disabled={isDisabled}>
          <Option value=''>请选择布尔类型</Option>
          <Option value='true'>true</Option>
          <Option value='false'>false</Option>
        </Select>
      )
    }

    if (item.name === 'id') {
      return <Input placeholder={item.description} disabled />
    }

    if (item.name === 'created_at' || item.name === 'updated_at') {
      return (
        <DatePicker
          style={{width: '100%'}}
          showTime
          format={constants.DATE_FORMAT.YMDHMS}
          disabled={isDisabled}
        />
      )
    }

    if (item.type === 'date') {
      return (
        <DatePicker
          style={{width: '100%'}}
          showTime
          format={constants.DATE_FORMAT.YMDHMS}
          disabled={isDisabled}
        />
      )
    }

    if (item.type === 'file') {
      return (
        <FileUpload
          item={item}
          setField={this.setField}
          onRemove={isDisabled ? e => false : e => true}
          disabled={isDisabled} />
      )
    }

    let placeholder
    if (item.name === 'created_by') {
      placeholder = '请输入用户 id, 不填写则默认为当前帐号 id'
    } else if (item.description) {
      placeholder = `${item.description}`
    } else {
      placeholder = `${item.name}`
    }
    return <Input placeholder={placeholder} disabled={isDisabled} />
  }

  handleFileInput = (rule, value, callback) => {
    if (value) {
      if (value.file && value.file.name && util.checkUploadFileType(value.file.name)) {
        callback('文件类型不合法')
      }
      if (value.fileList && value.fileList.length >= 2) {
        callback('上传文件数量超过限制')
      }
    }
    callback()
  }

  setField = (value, item) => {
    let {form} = this.props
    form.setFieldsValue({[item.name]: value})
  }

  render() {
    const {fields, form, editType, className} = this.props
    const {getFieldDecorator} = form
    let formItemLayout = this.formItemLayout

    if (!fields || fields.length === 0) return null
    return (
      <div className={cls(className, 'create-form-item-fields')}>
        {
          fields.map(v => {
            let item = v.origin
            if (!item) return null
            // 若属于保护字段则 item.disabled = true
            // this.handleProtectedFields(item)
            // hide id、acl_permission、acl_gid
            if ((editType === 'new' && item.name === 'id') ||
              item.name === 'acl_permission' ||
              item.name === 'acl_gid' ||
              item.name === ''
            ) {
              return null
            }

            return (
              <FormItem
                label={formatLabel(item.description || item.name)}
                key={item.name}
                {...(item.formItemLayout || formItemLayout)}>
                {getFieldDecorator(item.name, this.getValidateConfig(item))(
                  this.renderOrdinaryForm(item)
                )}
              </FormItem>
            )
          })
        }

      </div>
    )
  }
}
