import './App.css'
//import { Todo } from './components/todo'
import {SignUpPage} from './components/signup'
import {SignInPage} from './components/signin'
import {Todo} from './components/todo'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'


function App() {
  

  return (
    <>
    <div className="App">
      <div className='navbar'>
        <ul>
          <li>Home</li>
          <li>TODO List</li>
        </ul>
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/todo" element={<Todo />} />
        </Routes>
      </Router>
    </div>
      
    </>
  )
}

export default App