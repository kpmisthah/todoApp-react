import { useEffect, useState, useRef, FormEvent } from "react";
import './TodoForm.css'

interface Todo {
  id: number;
  task: string;
  completed: boolean;
}

type TabType = 'all' | 'pending' | 'completed';

export default function TodoForm() {
  const [todo, setTodo] = useState<Todo[]>([]);
  const [text, setText] = useState<string>("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const isInitialMount = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("todos");
      if (saved) {
        const parsed = JSON.parse(saved);
        setTodo(parsed);
      }
    } catch (error) {
      console.error("Failed to load todos from localStorage:", error);
    }
  }, []);

  // Save to localStorage whenever todo changes (but not on first render)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      try {
        localStorage.setItem("todos", JSON.stringify(todo));
      } catch (error) {
        console.error("Failed to save todos to localStorage:", error);
      }
    }
  }, [todo]);

  useEffect(() => {
    if (editIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editIndex]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editIndex !== null) {
      setTodo((prev) =>
        prev.map((item) => item.id === editIndex ? { ...item, task: text } : item)
      );
      setEditIndex(null);
    } else {
      addTodo(text);
    }
    setText("");
  }

  function addTodo(text: string) {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    const newTodo = {
      id: Date.now(),
      task: trimmedText,
      completed: false,
    };
    setTodo((prevTodo) => [...prevTodo, newTodo]);
  }

  function handleEdit(id: number) {
    let updateTodo = todo.find((task) => task.id === id);
    if (updateTodo) {
      setEditIndex(id);
      setText(updateTodo.task);
    }
  }


  function confirmDelete(id: number) {
    setDeleteConfirmId(id);
  }

  function handleDelete() {
    if (deleteConfirmId !== null) {
      setTodo((prevTodos) => prevTodos.filter((task) => task.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  }

  function cancelDelete() {
    setDeleteConfirmId(null);
  }


  function toggleComplete(id: number) {
    setTodo((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }


  const filteredTodos = todo.filter((todoItem) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return !todoItem.completed;
    if (activeTab === 'completed') return todoItem.completed;
    return true;
  });


  const pendingCount = todo.filter(t => !t.completed).length;
  const completedCount = todo.filter(t => t.completed).length;
  
  return (
    <div className="todo-container">
      <div className="todo-app">
        <div className="app-header">
          <h1>Task Manager</h1>
        </div>
        <div className="app-content">
          <form onSubmit={handleSubmit} className="todo-form">
            <div className="input-group">
              <input
                ref={inputRef}
                name="todo"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What needs to be done?"
                className="todo-input"
              />
              <button type="submit"className="add-button">
                {editIndex !== null ? "Update" : "Add"}
              </button>
            </div>
          </form>

          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({todo.length})
            </button>
            <button 
              className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending ({pendingCount})
            </button>
            <button 
              className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed ({completedCount})
            </button>
          </div>

          <div className="tasks-container">
            {filteredTodos.length === 0 ? (
              <p className="empty-message">No {activeTab} tasks</p>
            ) : (
              <ul className="task-list">
                {filteredTodos.map((todoItem) => (
                  <li key={todoItem.id} className="task-item">
                    <div className="task-left">
                      <input
                        type="checkbox"
                        checked={todoItem.completed}
                        onChange={() => toggleComplete(todoItem.id)}
                        className="task-checkbox"
                      />
                      <span className={`task-text ${todoItem.completed ? 'completed' : ''}`}>
                        {todoItem.task}
                      </span>
                    </div>
                    <div className="task-actions">
                      {!todoItem.completed && (
                        <button
                          onClick={() => handleEdit(todoItem.id)}
                          className="edit-button"
                          title="Edit"
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        onClick={() => confirmDelete(todoItem.id)}
                        className="delete-button"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="app-footer">
          {todo.length} total tasks • {completedCount} completed • {pendingCount} pending
        </div>
      </div>
      {deleteConfirmId !== null && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal">
            <div className="delete-icon">🗑️</div>
            <h2>Delete Confirmation</h2>
            <p>Are you sure you want to delete this task?</p>
            <div className="confirmation-task">
              "{todo.find(t => t.id === deleteConfirmId)?.task}"
            </div>
            <div className="confirmation-buttons">
              <button onClick={cancelDelete} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleDelete} className="confirm-button">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}