import React from 'react'
import './index.css'

export default class SchemaList extends React.Component {
  render() {
    return <div className='schema-list-wrapper'>
      <h3>数据表</h3>
      <ul className='schema-list'>
        <li className='schema-list-item'><a href="#">01</a></li>
        <li className='schema-list-item'><a href="#">02</a></li>
        <li className='schema-list-item'><a href="#">03</a></li>
        <li className='schema-list-item'><a href="#">04</a></li>
        <li className='schema-list-item'><a href="#">05</a></li>
      </ul>
    </div>
  }
}