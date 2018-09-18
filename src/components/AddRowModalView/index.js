import API from '../../io'
import CreateFormItem from '../CreateFormItem'
import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import util from '../../utils'
import {Form, message, Modal} from 'antd'

let isCreating = false
let client = API.schema

class AddRowModalView extends React.Component {
  state = {
    aclPermission: {
      _read_perm: [],
      _write_perm: []
    },
    arrayRequired: false,
    uuid: {}
  }

  get editType() {
    return this.props.currentEditingRow ? 'edit' : 'new'
  }

  componentDidMount() {
    if (!this.props.show) return false

    this.initFieldsValue()
    if (this.editType === 'edit') {
      this.setFieldsValue(this.props.currentEditingRow)
    }
  }

  /**
   * 隐藏当前 modal
   */
  hideModal = () => {
    this.props.onClose()
  }

  /**
   * 创建或保存一行数据
   */
  addRow = () => {
    if (isCreating) return
    let editType = this.editType
    const {
      fields, form, currentEditingRow, tableID
    } = this.props
    const {validateFieldsAndScroll} = form
    const columns = fields.map(v => v.origin)
    validateFieldsAndScroll((err, value) => {
      if (err) {
        return err
      }

      columns.forEach(item => {
        if (item.type === 'file') {
          let file = value[item.title]
          let ret, tmp
          if (!file) {
            // file 为 null
            ret = null
          } else if (typeof file === 'string') {
            // file 为 json，在 file 类型文件实际提交时，需要删除多余的 path 字段
            tmp = JSON.parse(value[item.title])
            delete tmp.path
            ret = tmp
          } else {
            // file 为 obj
            delete value[item.title].path
            ret = value[item.title]
          }

          value[item.title] = ret
        }
      })

      isCreating = true
      let json = this.parseData(value, editType)

      // api
      if (editType === 'new') {
        client.createRow(tableID, json).then(res => {
          message.success('添加成功')
          this.props.onClose()
          isCreating = false
        }).catch(e => {
          message.error(e.message)
          isCreating = false
        })
      } else {
        client.updateRow(tableID, currentEditingRow._id, json).then(res => {
          message.success('编辑成功')
          this.props.onClose()
          isCreating = false
        }).catch(e => {
          message.error(e.message)
          isCreating = false
        })
      }
    })
  }

  /**
   * 将表单数据解析为 json
   * @param value 表单数据
   * @param editType
   */
  parseData = (value, editType) => {
    let {fields} = this.props
    return parseFormValue(value, editType, fields.map(v => v.origin))
  }

  /**
   * 初始化表单数据域
   */
  initFieldsValue = () => {
    let {form, fields} = this.props
    setFormDefaultValue(fields, form)
  }

  /**
   * 根据选择的数据行给表单域设置初始值
   * @param selectRow 选择的数据行
   */
  setFieldsValue = selectRow => {
    let {fields, form} = this.props
    setFormFieldsValue(selectRow, form, fields.map(v => v.origin))
  }

  /**
   * 将其他类型的值转化为字符串，便于表单展示
   * @param value 数据值
   */
  getFieldInitValue = value => {
    return getFormFieldInitValue(value)
  }

  render() {
    const {
      form,
      fields,
      show
    } = this.props
    const {getFieldsValue} = form

    let editType = this.editType

    // if (!show) return null
    return (
      <Modal
        className='add-row-modal'
        visible={show}
        title={editType === 'new' ? '添加数据行' : '修改数据行'}
        width={765}
        okText={editType === 'new' ? '添加' : '保存'}
        cancelText={'取消'}
        onCancel={this.hideModal}
        onOk={() => {
          this.addRow(getFieldsValue())
        }}
      >
        <Form>
          <div className='fields-collect'>
            <CreateFormItem
              container='add-row-modal'
              fields={fields}
              form={form}
              editType={editType} />
          </div>
        </Form>
      </Modal>
    )
  }
}

/**
 * 设置 form 初始值
 * @param fields
 * @param form
 */
export function setFormDefaultValue(fields, form) {
  let {getFieldDecorator} = form

  fields.forEach(v => {
    let item = v.origin
    if (item.name === 'created_at' || item.name === 'updated_at' || item.type === 'date') {
      if (item.default) {
        getFieldDecorator(item.name, {initialValue: moment(getFormFieldInitValue(item.default))})
      }
    } else if (item.type === 'file') {
      if (item.default) {
        getFieldDecorator(item.name, {initialValue: item.default})
      } else {
        getFieldDecorator(item.name, {initialValue: ''})
      }
    } else {
      if ('default' in item && item.default.toString()) {
        getFieldDecorator(item.name, {initialValue: getFormFieldInitValue(item.default)})
      }
    }
  })
}

/**
 * 将数据行填充至 form 对象
 * @param selectRow 数据行
 * @param form form对象
 * @param fields 列数据
 */
export function setFormFieldsValue(selectRow, form, fields) {
  const {getFieldDecorator} = form

  Object.keys(selectRow).forEach(key => {
    if (key === 'created_at' || key === 'updated_at') {
      getFieldDecorator(key, {initialValue: moment.unix(selectRow[key])})
    } else if (key === 'write_perm' || key === 'read_perm' || key === 'acl_gid' || key === 'acl_permission') {

    } else if (fields.find(item => (item.name === key) && (item.type === 'file'))) {
      let obj = selectRow[key]
      let value = obj
      value && delete value.path
      getFieldDecorator(key, {initialValue: value})
    } else if (fields.find(item => (item.name === key) && (item.type === 'date'))) {
      if (selectRow[key]) {
        getFieldDecorator(key, {initialValue: moment(getFormFieldInitValue(selectRow[key]), moment.ISO_8601)})
      } else {
        getFieldDecorator(key, {initialValue: null})
      }
    } else if (selectRow[key] && typeof selectRow[key] === 'object') {
      getFieldDecorator(key, {initialValue: JSON.stringify(selectRow[key])})
    } else {
      getFieldDecorator(key, {initialValue: getFormFieldInitValue(selectRow[key])})
    }
  })
}

/**
 * 格式化 表单value
 * @param value
 * @returns {*}
 */
export function getFormFieldInitValue(value) {
  if (Object.prototype.toString.call(value) === '[object Boolean]') {
    return value.toString()
  }
  if (value) {
    return value.toString()
  } else if (value === 0) {
    return 0
  } else {
    return ''
  }
}

/**
 * 格式化表单数据对象
 * @param value
 * @param editType
 * @param fields
 * @returns {{}}
 */
export function parseFormValue(value, editType, fields) {
  let data = {}
  Object.keys(value).forEach(key => {
    // moment 对象转化为时间戳
    if ((key === 'created_at' || key === 'updated_at') && value[key]) {
      value[key] = value[key].unix()
    }
    // 转化其他类型的数据
    fields.forEach(item => {
      if (item.name === key && item.type !== 'array' && item.type !== 'file') {
        value[key] = util.formatDiffrentTypeValue(value[key], item.type)
      }
    })

    if (value[key] === '') {
      data[key] = null
    } else {
      data[key] = value[key]
    }

    // 若字段为空则不传
    if (editType === 'new' &&
      (
        data[key] === null ||
        data[key] === undefined ||
        !data[key].toString() ||
        (Array.isArray(data[key]) &&
          !data[key].length)
      )) {
      delete data[key]
    }
  })
  return data
}

AddRowModalView.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  fields: PropTypes.array,
  form: PropTypes.object,
  currentEditingRow: PropTypes.object,
  tableID: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

export default Form.create()(AddRowModalView)
