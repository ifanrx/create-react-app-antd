import React, {Component} from 'react';
import SchemaTable from './components/SchemaTable'
import SchemaList from './components/SchemaList'
import {Form, Select, InputNumber, DatePicker, Switch, Slider, Button, message, Row, Col, Table} from 'antd';
import './App.css';

const {Option} = Select;

class App extends Component {
  render() {
    return <div className='page-wrapper'>
      <SchemaList />
      <SchemaTable />
    </div>
  }
}

export default App;
