//import todoData from "../../todo.json";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

type Todo = {
  todoId: string;
  title: string;
  username: string;
  done: boolean;
};

export function Todo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<string>("all");
  const location = useLocation();
  const username = location.state.username;

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        // Make API call to fetch todos for the signed-in user
        const response = await axios.get(`http://localhost:3000/todos?username=${username}`);
        console.log(response.data);
        if(response.data){
          setTodos(response.data);
        }else{
          setTodos([]);
        } 
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, [username]);

  const handleTaskAdd = async () => {
    try {
      // Make API call to add a new task
      const response = await axios.post(`http://localhost:3000/todos`, {
        title: newTaskTitle,
        username: username,
        done: false
      });
      console.log(response.data);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDeleteTask = async (todoId: string) => {
    try {
      // Make API call to delete a task
      const response = await axios.post(`http://localhost:3000/delete?todoId=${todoId}`);
      console.log(response.data);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const handleMarkDone = async (todoId: string) => {
    try{
      // Make API call to mark a task as done
      console.log("Marking task as done", todoId);
      const response = await axios.post(`http://localhost:3000/markdone?todoId=${todoId}`);
      console.log(response.data);
    } catch (error) {
      console.error('Error marking task as done:', error);
    }
  }
  const handleMarkUndone = async (todoId: string) => {
    try{
      // Make API call to mark a task as undone
      console.log("Marking task as undone", todoId);
      const response = await axios.post(`http://localhost:3000/markUndone?todoId=${todoId}`);
      console.log(response.data);
    } catch (error) {
      console.error('Error marking task as undone:', error);
    }
  }
  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') {
      return true; // Show all todos
    } else if (filter === 'done') {
      return todo.done; // Show only completed todos
    } else {
      return !todo.done; // Show only incomplete todos
    }
  });

  return (
    <div className="container">
      <h1>Todo List</h1>
      {/* An input field for title and an add button to add a new task with the given title */}
      <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Title" />
      <button type="submit" onClick={handleTaskAdd}>Add</button>

      {/* Dropdown menu for filtering todos */}
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="done">Done</option>
        <option value="undone">Undone</option>
      </select>

      <>
        {filteredTodos.length === 0 ? (
          <p>No todos found</p>
        ) : (
          <>
            {/* Display filtered todos */}
            <div className="todo">
              {filteredTodos.map((todo: Todo) => (
                <div className="card" key={todo.todoId}>
                  <h3>{todo.title}</h3>
                  <p>Assignee: {todo.username}</p>
                  <p>Status: {todo.done ? "Done" : "Not Done"}</p>
                  {/* delete button for each task to delete it from the database */}
                  <button onClick={() => handleDeleteTask(todo.todoId)}>Delete</button>
                  {/* A button to mark a task as done if the task is undone */}
                  {!todo.done && <button onClick={() => handleMarkDone(todo.todoId)}>Mark as done</button>}
                  {/* A button to mark a task as undone if the task is done */}
                  {todo.done && <button onClick={() => handleMarkUndone(todo.todoId)}>Mark as undone</button>}
                  {/* A button to update the title of the task */}
                  <button>Update</button>
                </div>
              ))}
            </div>
          </>
        )}
      </>
    </div>
  );
}

