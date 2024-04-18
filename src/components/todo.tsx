import todoData from "../../todo.json";

type Todo = {
  id: number;
  title: string;
  assignee: string;
  done: boolean;
};

export function Todo() {
  return (
    <div className="container">
      <div className="todo">
        {todoData.map((todo: Todo) => (
          <div className="card" key={todo.id}>
            <h3>{todo.title}</h3>
            <p>Assignee: {todo.assignee}</p>
            <p>Status: {todo.done ? "Done" : "Not Done"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

