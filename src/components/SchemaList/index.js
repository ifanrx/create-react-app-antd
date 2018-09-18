import React from 'react'
import './index.css'
import CommonContainer from '../CommonContainer'
import cls from 'classnames'

export default class SchemaList extends React.Component {
  handleClick = id => {
    let s = new URLSearchParams()
    s.append('id', id)
    window.location.search = `?${s.toString()}`
  }

  render() {
    return <CommonContainer style={{padding: 0}} className='schema-list-wrapper'>
      <h3 className='schema-list-title'>
        <center>数据表</center>
      </h3>
      <ul className='schema-list'>
        {window._USER_CONFIG.TABLE_LIST.map(v => {
          return <li key={v.id} className={cls('schema-list-item', {active: window.ACTIVE_TABLE_ID == v.id})}>
            <a onClick={this.handleClick.bind(this, v.id)} href='javascript:void (0)'>{v.name}</a>
          </li>
        })}
      </ul>
    </CommonContainer>
  }
}
