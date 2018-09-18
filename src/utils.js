import React from 'react'
import {Tooltip} from 'antd'
import moment from 'moment'
import constants from './constants'

const SCHEMA_TYPE_WHITE_LIST = ['id', 'string', 'integer', 'number', 'file', 'boolean', 'date']

class TableCell extends React.Component {
  render() {
    return <div className='table-cell'>
      {this.props.children}
    </div>
  }
}

export default {
  formatColumn(fields) {
    let cnt = 0
    let columns = []

    for (let i = 0, len = fields.length; i < len; i++) {
      let field = fields[i]
      if (!SCHEMA_TYPE_WHITE_LIST.includes(field.type)) {
        continue
      }
      if (['acl_gid', 'acl_permission'].indexOf(field.name) == -1) {
        columns[cnt++] = {
          title: <Tooltip title={field.description || field.name}>
            <div className='column-title'>{field.description || field.name}</div>
          </Tooltip>,
          key: field.name === 'id' ? '_id' : field.name,
          dataIndex: field.name === 'id' ? '_id' : field.name,
          type: field.type,
          description: field.description ? field.description : field.name,
          width: 200,
          render: text => {
            let content = ''

            if (field.name === 'created_at' || field.name === 'updated_at') {
              content = moment.unix(text).format(constants.DATE_FORMAT.YMDHMS)
            } else if (field.type === 'date') {
              content = moment(text).format(constants.DATE_FORMAT.YMDHMS)
            } else if (field.type === 'file') {
              content = text ? text.path : ''
            } else if (Object.prototype.toString.call(text) === '[object Object]' ||
              Object.prototype.toString.call(text) === '[object Undefined]' ||
              Object.prototype.toString.call(text) === '[object Null]') {
              return ''
            } else {
              content = text.toString()
            }

            return <Tooltip placement='topLeft' title={content}>
              <div>
                <TableCell>
                  {content}
                </TableCell>
              </div>
            </Tooltip>
          },
          origin: field
        }
      }
    }

    return columns
  },
  /**
   * @description 对大于设置长度的字符串进行格式处理
   * @param {str, len} 字符串 显示字符串长度
   */
  textFormat(str, len = 20) {
    if (!str) {
      return ''
    }
    if (str.length <= len) {
      return str
    }

    if (!str.substring(0, len).match(new RegExp(/\w/, 'g'))) {
      return `${str.substr(0, len)}...`
    }

    let addLen = Math.floor(str.substring(0, len).match(new RegExp(/\w/, 'g')).length / 2)

    let countLen = addLen
    for (let i = len; i < len + addLen; i++) {
      countLen = !!str[i] && !!str[i].match(new RegExp(/\w/)) ? countLen + 1 : countLen
    }

    return str.length > len + countLen ? `${str.substr(0, len + countLen)}...` : str
  },
  formatDiffrentTypeValue(value, type) {
    if (value == undefined) return ''
    if (type) {
      if (value === '' && type !== 'geojson') return ''
      switch (type) {
      /* eslint-disable */
        case 'boolean':
          return JSON.parse(value)
        case 'integer':
          return parseInt(value, 10)
        case 'number':
          return parseFloat(value, 10)
        case 'array':
          return value.join(',')
        case 'file':
          if (!value) {
            return {}
          }
          return value.path
        /* eslint-disable */
      }
    } else {
      if (typeof value === 'boolean') {
        return value.toString()
      } else if (value instanceof Array) {
        return `[ ${value.join(',')} ]`
      } else if (typeof value === 'object') {
        return JSON.stringify(value)
      }
    }
    return value
  },
  isEmptyObj(obj) {
    let type = Object.prototype.toString.call(obj)

    if (type !== '[object Object]') {
      return false
    }

    for (var key in obj) {
      return false
    }

    return true
  },
  checkUploadFileType(fileName, type) {
    let blackListRegx = new RegExp(`\.(${type || 'htm|html|xhtml|asp|aspx|php|jsp'})$`, 'i')
    return blackListRegx.test(fileName)
  }
}