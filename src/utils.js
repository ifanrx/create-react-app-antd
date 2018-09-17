import React from 'react'
import {Tooltip} from 'antd'

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
    const columnsAddedMap = {
      acl: 'string',
    }

    for (let i = 0, len = fields.length; i < len; i++) {
      let field = fields[i]

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

            // if (Object.prototype.toString.call(text) === '[object Boolean]' ||
            //   Object.prototype.toString.call(text) === '[object Number') {
            //   return <Tooltip placement='topLeft' title={text.toString()}>{text.toString()}</Tooltip>
            // }
            if (Object.prototype.toString.call(text) === '[object Array]') {
              return <Tooltip placement='topLeft' title={text.toString()}>
                <div>
                  <TableCell>
                    {'[' + text.toString() + ']'}
                  </TableCell>
                </div>
              </Tooltip>
            }
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

    for (let key in columnsAddedMap) {
      columns.push({
        title: key,
        key: key,
        dataIndex: key,
        type: columnsAddedMap[key],
        description: key,
        width: 200,
        render: text => {
          if (!text || Object.prototype.toString.call(text) === '[object Object]') return
          return <Tooltip placement='topLeft' title={text}>{text}</Tooltip>
        },
      })
    }

    return columns
  }
}