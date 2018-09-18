import React from 'react'
import ReactDOM from 'react-dom'
import 'url-search-params-polyfill'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

let s = new URLSearchParams(window.location.search.replace('?', ''))

let id = s.get('id')
if (id) {
  window.ACTIVE_TABLE_ID = id
}

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
