import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

document.getElementsByTagName("year")[0].innerHTML = new Date().getFullYear()

ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )