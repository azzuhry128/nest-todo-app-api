export class CreateTodoRequest {
  title: string;
  description: string;
  account_id: string;
}

export class GetTodoRequest {
  account_id: string;
}

export class UpdateTodoRequest {
  todo_id?: string;
  title?: string;
  description?: string;
  status?: boolean;
  due_date?: string;
  priority?: string;
}

export class DeleteTodoRequest {
  todo_id: string;
}

export class TodoResponse {
  todo_id: string | null;
  title?: string | null;
  description?: string | null;
  status?: boolean | null;
  due_date?: Date | null;
  priority?: string | null;
  tags?: string[] | null;
  account_id: string | null;
}
