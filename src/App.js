import React, {Component} from 'react'
import SchemaTable from './components/SchemaTable'
import SchemaList from './components/SchemaList'
import './App.css'
import API from './io'

class App extends Component {
  constructor() {
    super()

    this.state = {
      schemaList: []
    }
  }

  componentDidMount() {
    API.schema.getSchemaList().then(res => {
      this.setState({
        schemaList: res.data.objects
      })
    })
  }

  render() {
    let {schemaList} = this.state
    return <div className='page-wrapper'>
      <SchemaList schemaList={schemaList} />
      <SchemaTable schemaList={schemaList} />
    </div>
  }
}

export default App
