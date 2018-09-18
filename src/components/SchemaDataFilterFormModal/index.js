import React from 'react'
import {Modal, Form, Input, DatePicker} from 'antd'
import constants from '../../constants'
import moment from 'moment'
import PropTypes from 'prop-types'

const FormItem = Form.Item
const RangePicker = DatePicker.RangePicker

class SchemaDataFilterFormModal extends React.Component {
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

  handleOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return false

      let filter = []

      if (values.id) {
        filter.push({
          _id: {
            $eq: values.id
          }
        })
      }

      if (values.updated_at) {
        filter.push({
          updated_at: {
            $range: values.updated_at.map(v => moment(v).unix())
          }
        })
      }

      this.props.setQuery(filter.length > 0 ? {$and: filter} : {})
      this.handleCancel()
    })
  }

  handleCancel = () => {
    this.props.onClose()
  }

  render() {
    let {show, form} = this.props
    let {getFieldDecorator} = form
    return <Modal
      visible={show}
      title={'查询'}
      onCancel={this.handleCancel}
      onOk={this.handleOk}
    >
      <FormItem
        label='id'
        {...(this.formItemLayout)}>
        {getFieldDecorator('id')(
          <Input placeholder='请输入 id' />
        )}
      </FormItem>
      <FormItem
        label='updated_at'
        {...(this.formItemLayout)}>
        {getFieldDecorator('updated_at')(
          <RangePicker
            showTime
            format={constants.DATE_FORMAT.YMDHMS} />
        )}
      </FormItem>
    </Modal>
  }
}

SchemaDataFilterFormModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  setQuery: PropTypes.func
}

export default Form.create()(SchemaDataFilterFormModal)
