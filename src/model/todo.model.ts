export class CreateTodoRequest {
  title: string;
  description: string;
  status: string;
  due_date: string;
  priority: string;
  account_id: string;
}

export class GetTodoRequest {
  account_id: string;
}

export class UpdateTodoRequest {
  title: string;
  description: string;
  status: string;
  due_date: string;
  priority: string;
}

export class DeleteTodoRequest {
  account_id: string;
  todo_id: string;
}

export class TodoResponse {
  account_id: string;
  todo_id: string;
  title: string;
}
