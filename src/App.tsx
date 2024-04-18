import './App.css'
//import { Todo } from './components/todoList'
import {SignUpPage} from './components/signup'

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
      <SignUpPage />
    </div>
      
    </>
  )
}

export default App