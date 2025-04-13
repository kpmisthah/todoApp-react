import { useEffect, useState, useRef, FormEvent } from "react";
interface Todo {
  id: number;
  task: string;
  completed: boolean;
}
export default function TodoForm() {
  const [todo, setTodo] = useState<Todo[]>([]);
  const [text, setText] = useState<string>("");
  const[editIndex,setEditIndex] = useState<number|null>(null)
  const isInitialMount = useRef(true);

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

  function handleChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if(editIndex!=null){
        setTodo((prev)=>
            prev.map((item)=>item.id == editIndex?{...item,task:text}:item)
        )
        setEditIndex(null)
    }else{
        addTodo(text);
        setText("");
    }

  }

  function addTodo(text: string) {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    const newTodo = {
      id: Date.now(),
      task: trimmedText,
      completed: false,
    };
    setTodo((prevTodo)=>[...prevTodo,newTodo])
  }

  function handleEdit(id:number){
    let updateTodo = todo.find((task)=>task.id == id)
    if(updateTodo){
        setEditIndex(id)
        setText(updateTodo.task)
    }
  }
  function handleDelete(id:number){
    let deleteTodo = todo.find((task)=>task.id==id)
    if(deleteTodo){
        let updateTodo =todo.filter((task)=>task.id!=deleteTodo.id)
        setTodo(updateTodo)
    }
  }
  // function deleteTask() {}
    // function moveTaskUp(index) {}

    // function moveTaskDown(index) {}
    return (
      <div className="to-do-list">
        <h1>Todo List</h1>
        <form onSubmit={handleChange}>
          <input
            name="todo"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit">{editIndex!=null ? "Update":'Add'}</button>
        </form>
        <ul>
          {todo.map((todos) => (
            <li key={todos.id}>
                {todos.task}
                <button onClick={()=>handleEdit(todos.id)}>Edit</button>
                <button onClick={()=>handleDelete(todos.id)}>Delete</button>
                </li>
            
          ))}
        </ul>
      </div>
    );
  }

