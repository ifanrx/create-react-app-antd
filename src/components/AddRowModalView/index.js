import ACLCheckboxGroup from '../ACLCheckboxGroup'
import client from 'io/schema'
import constants, {DATE_FORMAT} from 'config/constants'
import CreateFormItem from '../CreateFormItem'
import React from 'react'
import moment from 'moment'
import util from 'utils/helper'
import {connect} from 'react-redux'
import {Form, message, Modal} from 'antd'
import sendGA from 'utils/ga'
import {
  getSchemaData,
  selectRow,
  toggleAddRowModalView,
  updateFilterObject,
  updateSchemaPage,
  updateQueryObject,
} from 'redux/actions/schemaAction'
import {getUserId} from 'utils'
import {_} from 'i18n-utils'
import './index.scss'

let hasModalRenderd = false
let isCreating = false

class AddRowModalView extends React.Component {
  state = {
    aclPermission: {
      _read_perm: [],
      _write_perm: [],
    },
    arrayRequired: false,
    uuid: {},
  }

  /**
   * 更新阶段的生命周期函数
   * @param nextProps 新的属性值
   */
  componentWillReceiveProps(nextProps) {
    const groupsId = this.props.groups.map(group => group.id.toString())
    if (nextProps.selectRows.length > 0 && nextProps.editType === 'edit' && !hasModalRenderd) {
      hasModalRenderd = true
      const selectRow = nextProps.selectRows[0]
      this.setState({
        aclPermission: {
          _read_perm: [...this.filterDeletedGroups(selectRow.read_perm, groupsId)],
          _write_perm: [...this.filterDeletedGroups(selectRow.write_perm, groupsId)],
        },
      })
      this.initFieldsValue()
      this.setFieldsValue(nextProps.selectRows[0])
    } else if (nextProps.editType === 'new' && !hasModalRenderd) {
      hasModalRenderd = true
      const defaultRowPerm = util.getDefaultAclPermission(nextProps.schemaList, nextProps.currentSchemaID)
      this.setState({
        aclPermission: {
          _read_perm: [...this.filterDeletedGroups(defaultRowPerm._read_perm, groupsId)],
          _write_perm: [...this.filterDeletedGroups(defaultRowPerm._write_perm, groupsId)],
        },
      })
      this.initFieldsValue()
    }
  }

  filterDeletedGroups = (values, groupsId) => {
    return values.map(val => {
      if (val.indexOf('gid') === 0 && groupsId.indexOf(val.substring(4)) === -1) {
        val = 'gid:'
      }
      return val
    })
  }

  /**
   * 隐藏当前 modal
   */
  hideModal = () => {
    hasModalRenderd = false
    this.clearArrayField()
    this.props.dispatch(toggleAddRowModalView())
  }

  validateAClEmptyGroup = rowAclPerm => {
    return JSON.stringify(Object.assign({}, rowAclPerm)).match(/"gid:"/g) !== null
  }

  /**
   * 创建或保存一行数据
   */
  addRow = () => {
    if (isCreating) return
    const {currentSchemaID, editType, selectRows, form, dispatch, queryObj, filterObj, isBuildInSchema} = this.props
    const {validateFieldsAndScroll} = form

    let {aclPermission} = this.state
    if (!isBuildInSchema && aclPermission._read_perm.length === 0 && aclPermission._write_perm.length === 0) {
      return message.error(_('请选择行的默认 ACL 权限'))
    }
    if (this.validateAClEmptyGroup(aclPermission)) {
      return message.error(_('请选择一个用户组授权'))
    }

    validateFieldsAndScroll((err, value) => {
      if (err) {
        return err
      }
      let {columns, currentSchema} = this.props

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
      json = this.cleanArrayFieldKeys(json)
      json = {
        ...json,
        write_perm: aclPermission._write_perm,
        read_perm: aclPermission._read_perm,
      }

      // 判断是否有 Array 要求必填但没有填
      const requiredArray = currentSchema.fields.filter(col => {
        return col.type === 'array' && col.constraints && col.constraints.required && !json[col.name]
      })
      if (requiredArray.length) {
        this.setState({
          arrayRequired: true,
        })
        isCreating = false
        return
      } else {
        this.setState({
          arrayRequired: false,
        })
      }
      // api
      if (editType === 'new') {
        client.createRow(currentSchemaID, json).then(res => {
          if (res.status !== constants.STATUS_CODE.CREATED) {
            util.formatResponse({res, code: constants.STATUS_CODE.CREATED})
            return
          }
          util.formatResponse({res, code: constants.STATUS_CODE.CREATED, okMsg: _('添加成功')})
          sendGA('点击 - 添加行', sendGA.CATEGORY.SCHEMA, '确认添加')
          this.setState({aclPermission: {}})
          dispatch(toggleAddRowModalView(''))

          // 创建行成功后，重新拉取数据表数据并更新页码
          dispatch(updateSchemaPage(1))
          let queryObject = {offset: 0, limit: constants.SCHEMA_PAGE_LIMIT, order_by: '-created_at'}
          dispatch(getSchemaData(currentSchemaID, util.setQuery(queryObject))).then(res => {
            if (res.payload.status === constants.STATUS_CODE.SUCCESS) {
              dispatch(updateQueryObject(queryObject))
            } else {
              util.formatResponse({res, code: constants.STATUS_CODE.SUCCESS})
            }
          })
          dispatch(updateFilterObject({}))
          this.clearArrayField()

          setTimeout(() => {
            hasModalRenderd = false
            isCreating = false
          }, 1000)
        }).catch(res => {
          util.formatResponse({res, code: constants.STATUS_CODE.CREATED})
          isCreating = false
        })
      } else {
        client.updateRow(currentSchemaID, selectRows[0]._id, json).then(res => {
          if (res.status !== constants.STATUS_CODE.SUCCESS) {
            util.formatResponse({res, code: constants.STATUS_CODE.SUCCESS})
            return
          }
          util.formatResponse({res, code: constants.STATUS_CODE.SUCCESS, okMsg: _('已更新')})
          dispatch(toggleAddRowModalView(''))
          dispatch(getSchemaData(currentSchemaID, util.setQuery({...queryObj, ...filterObj})))
          dispatch(selectRow([]))
          this.setState({aclPermission: {}})
          this.clearArrayField()
          setTimeout(() => {
            hasModalRenderd = false
            isCreating = false
          }, 1000)
        }).catch(res => {
          util.formatResponse({res, code: constants.STATUS_CODE.SUCCESS})
          isCreating = false
        })
      }
    })
  }

  /**
   * 将表单数据解析为 json
   * @param value 表单数据
   */
  parseData = (value, editType) => {
    let {currentSchema} = this.props
    return parseFormValue(value, editType, currentSchema.fields)
  }
  // hack for clear array
  cleanArrayFieldKeys = jsonData => {
    let {currentSchema} = this.props
    return cleanFormArrayField(jsonData, currentSchema.fields)
  }

  /**
   * 维护 uuid
   * @param arrName 数组名称
   */
  manipulateUid = arrName => {
    let {getFieldValue} = this.props.form
    let {uuid} = this.state

    let keys = getFieldValue(`${arrName}keys`)
    if (keys.length > 0) {
      Object.assign(uuid, {[arrName]: keys[keys.length - 1]})
      this.setState({
        ...uuid,
      })
      return
    }
    Object.assign(uuid, {[arrName]: uuid[arrName] ? uuid[arrName] : 0})
    this.setState({
      ...uuid,
    })
  }

  /**
   * 初始化表单数据域
   */
  initFieldsValue = () => {
    let {currentSchema, form} = this.props
    setFormDefaultValue(currentSchema.fields, form, this.manipulateUid.bind(this))
  }

  clearArrayField = () => {
    let {form} = this.props
    form.resetFields()
  }

  /**
   * 根据选择的数据行给表单域设置初始值
   * @param selectRow 选择的数据行
   */
  setFieldsValue = selectRow => {
    let {currentSchema} = this.props
    setFormFieldsValue(selectRow, this.props.form, currentSchema.fields, this.manipulateUid.bind(this))
  }

  /**
   * 将其他类型的值转化为字符串，便于表单展示
   * @param value 数据值
   */
  getFieldInitValue = value => {
    return getFormFieldInitValue(value)
  }

  /**
   * acl 部分的渲染函数
   */
  renderACLRadios = () => {
    let {aclPermission} = this.state
    const {isBuildInSchema} = this.props
    if (isBuildInSchema) {
      return null
    }

    return (
      <div className='acl-wrapper'>
        <header className='acl-title'>{_('设置该行的读写权限')}</header>
        <ACLCheckboxGroup isNewRender onChange={this.handleCheckboxGroup} aclPermission={aclPermission} />
      </div>
    )
  }

  handleCheckboxGroup = value => {
    this.setState({
      aclPermission: {
        ...this.state.aclPermission,
        ...value,
      },
    })
  }

  render() {
    const {
      form,
      visible,
      currentSchema,
      selectRows,
      editType,
      isAddRowModalViewShow,
      protectedFields,
      isBuildInSchema,
    } = this.props
    const {getFieldsValue} = form

    if (!editType && !visible) return null
    return (
      <Modal
        className='add-row-modal'
        visible={isAddRowModalViewShow}
        title={editType === 'new' ? _('添加数据行') : _('修改数据行')}
        width={765}
        okText={editType === 'new' ? _('添加') : _('保存')}
        cancelText={_('取消')}
        onCancel={this.hideModal}
        onOk={() => {
          if (editType === 'new') {
            // 当确定的时候去掉默认的的排序条件
            this.props.setDefaultOrder()
          }
          this.addRow(getFieldsValue())
        }}
        ref={modal => {
          this.modal = modal
        }}
      >
        <Form>
          <div className='fields-collect'>
            {
              editType && <CreateFormItem
                container='add-row-modal'
                fields={currentSchema.fields}
                form={form}
                editType={editType}
                selectRows={selectRows}
                arrayRequired={this.state.arrayRequired}
                uuid={this.state.uuid}
                setUuid={value => this.setState({uuid: value})}
                isBuildInSchema={isBuildInSchema}
                protectedFields={protectedFields} />
            }
          </div>
          {this.renderACLRadios()}
        </Form>
      </Modal>
    )
  }
}

export default connect(state => ({
  columns: state.schema.columns,
  schemaList: state.schema.schemaList,
  currentSchema: state.schema.currentSchema,
  currentSchemaID: state.schema.currentSchemaID,
  selectRows: state.schema.selectRows,
  editType: state.schema.editType,
  groups: state.schema.groups,
  isAddRowModalViewShow: state.schema.isAddRowModalViewShow,
  initialColumnData: state.schema.initialColumnData,
  queryObj: state.schema.queryObj,
  filterObj: state.schema.filterObj,
  isBuildInSchema: state.schema.isBuildInSchema,
  protectedFields: state.schema.protectedFields,
}))(Form.create()(AddRowModalView))

/**
 * 设置 form 初始值
 * @param fields
 * @param form
 * @param manipulateUid 更新数组 uuid 回调
 */
export function setFormDefaultValue(fields, form, manipulateUid) {
  let {getFieldDecorator} = form

  fields.forEach(item => {
    if (item.type === 'array') {
      if (item.default) {
        getFieldDecorator(`${item.name}keys`, {initialValue: item.default.map((item, index, arr) => index)})
        manipulateUid(item.name)
        item.default.forEach((i, index) => {
          getFieldDecorator(`${item.name}-${index}`, {initialValue: getFormFieldInitValue(i)})
        })
      } else {
        getFieldDecorator(`${item.name}keys`, {initialValue: []})
        manipulateUid(item.name)
      }
    } else if (item.name === 'created_at' || item.name === 'updated_at' || item.type === 'date') {
      if (item.default) {
        getFieldDecorator(item.name, {initialValue: moment(getFormFieldInitValue(item.default), moment.ISO_8601)})
      } else {
        getFieldDecorator(item.name, {initialValue: null})
      }
    } else if (item.type === 'file') {
      if (item.default) {
        getFieldDecorator(item.name, {initialValue: item.default})
      } else {
        getFieldDecorator(item.name, {initialValue: ''})
      }
    } else if (item.name === 'created_by') {
      getFieldDecorator(item.name, {initialValue: getUserId()})
    } else if (item.type === 'object') {
      getFieldDecorator(item.name, {initialValue: item.default})
    } else {
      if ('default' in item && item.default.toString()) {
        getFieldDecorator(item.name, {initialValue: getFormFieldInitValue(item.default)})
      } else {
        getFieldDecorator(item.name, {initialValue: ''})
      }
    }
  })
}

/**
 * 将数据行填充至 form 对象
 * @param selectRow 数据行
 * @param form form对象
 * @param fields 列数据
 * @param manipulateUid 更新数组 uuid 回调
 */
export function setFormFieldsValue(selectRow, form, fields, manipulateUid) {
  const {getFieldDecorator, setFieldsValue} = form

  Object.keys(selectRow).forEach(key => {
    if (key === 'created_at' || key === 'updated_at') {
      getFieldDecorator(key, {initialValue: moment(getFormFieldInitValue(selectRow[key]), DATE_FORMAT.YMDHMS)})
    } else if (key === 'write_perm' || key === 'read_perm' || key === 'acl_gid' || key === 'acl_permission') {

    } else if (Object.prototype.toString.call(selectRow[key]) === '[object Array]') {
      let keys = selectRow[key].map((item, index, arr) => index)
      // 绑定数组
      setFieldsValue({[`${key}keys`]: keys})
      // 绑定数组中的每一个元素
      manipulateUid(key)
      keys.forEach((item, index) => {
        getFieldDecorator(`${key}-${item}`, {initialValue: getFormFieldInitValue(selectRow[key][item])})
      })
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
    } else if (fields.find(item => (item.name === key) && ((item.type === 'object') || (item.type === 'geojson')))) {
      getFieldDecorator(key, {initialValue: selectRow[key]})
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
  let arrName = ''
  let data = {}
  let arrPattern = /[0-9a-zA-Z]+-[0-9a-zA-Z]/
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
    // 数组元素
    if (arrPattern.test(key)) {
      arrName = key.slice(0, key.indexOf('-'))
      let type = fields.find(field => field.name === arrName).items.type || ''
      data[arrName] = data[arrName] || []
      data[`${arrName}keys`] && delete data[`${arrName}keys`]
      if (value[`${arrName}keys`].indexOf(parseInt(key.slice(key.indexOf('-') + 1))) !== -1) {
        data[arrName].push(util.formatDiffrentTypeValue(value[key], type))
      }
    } else {
      if (value[key] === '') {
        data[key] = null
      } else {
        data[key] = value[key]
      }
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

export function cleanFormArrayField(jsonData, fields) {
  let newJsonData = Object.assign({}, jsonData)
  fields.forEach(field => {
    if (field.type === 'array') {
      let keyName = `${field.name}keys`
      if (jsonData[keyName]) {
        newJsonData[field.name] = jsonData[keyName]
        delete newJsonData[keyName]
      }
    }
  })
  return newJsonData
}
