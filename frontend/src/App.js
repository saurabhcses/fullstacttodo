import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

// Set up axios defaults for authenticated requests
axios.defaults.baseURL = 'https://fullstacttodo-4.onrender.com';

// Todo component
const TodoApp = () => {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/todos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/todos', {
        title: inputValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos([response.data, ...todos]);
      setInputValue('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`/api/todos/${id}`, {
        completed: !completed
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(todos.map(todo => 
        todo._id === id ? response.data : todo
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const startEdit = (id, title) => {
    setEditingId(id);
    setEditValue(title);
  };

  const saveEdit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`/api/todos/${id}`, {
        title: editValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(todos.map(todo => 
        todo._id === id ? response.data : todo
      ));
      setEditingId(null);
      setEditValue('');
    } catch (error) {
      console.error('Error editing todo:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  if (!user) {
    return (
      <div className="App">
        <div className="auth-container">
          <div className="auth-switch">
            <button 
              className={`switch-button ${showLogin ? 'active' : ''}`}
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
            <button 
              className={`switch-button ${!showLogin ? 'active' : ''}`}
              onClick={() => setShowLogin(false)}
            >
              Register
            </button>
          </div>
          {showLogin ? (
            <Login onLogin={(userData, token) => {
              // Auth context will handle this
              window.location.reload();
            }} />
          ) : (
            <Register onRegister={(userData, token) => {
              // Auth context will handle this
              window.location.reload();
            }} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>Todo List</h1>
          <div className="user-info">
            <span>Welcome, {user.username}!</span>
            <button onClick={logout} className="logout-button">Logout</button>
          </div>
        </div>
        <form onSubmit={addTodo} className="todo-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new todo..."
            className="todo-input"
          />
          <button type="submit" className="todo-button">Add</button>
        </form>
        
        <div className="todo-list">
          {todos.map(todo => (
            <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              {editingId === todo._id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="edit-input"
                  />
                  <button onClick={() => saveEdit(todo._id)} className="save-button">Save</button>
                  <button onClick={cancelEdit} className="cancel-button">Cancel</button>
                </div>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo._id, todo.completed)}
                    className="todo-checkbox"
                  />
                  <span className="todo-text" onDoubleClick={() => startEdit(todo._id, todo.title)}>
                    {todo.title}
                  </span>
                  <div className="todo-actions">
                    <button onClick={() => startEdit(todo._id, todo.title)} className="edit-button">Edit</button>
                    <button onClick={() => deleteTodo(todo._id)} className="delete-button">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <TodoApp />
    </AuthProvider>
  );
}

export default App;
