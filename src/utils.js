import React from 'react'
import {Tooltip} from 'antd'


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
            if (Object.prototype.toString.call(text) === '[object Object]' ||
              Object.prototype.toString.call(text) === '[object Undefined]' ||
              Object.prototype.toString.call(text) === '[object Null]') return

            return <Tooltip placement='topLeft' title={text.toString()}>
              <div>
                <TableCell>
                  {text.toString()}
                </TableCell>
              </div>
            </Tooltip>
          },
          origin: field,
        }
      }
    }

    // for (let key in columnsAddedMap) {
    //   columns.push({
    //     title: key,
    //     key: key,
    //     dataIndex: key,
    //     type: columnsAddedMap[key],
    //     description: key,
    //     width: 200,
    //     render: text => {
    //       if (!text || Object.prototype.toString.call(text) === '[object Object]') return
    //       return <Tooltip placement='topLeft' title={text}>{text}</Tooltip>
    //     },
    //   })
    // }

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
  }
}