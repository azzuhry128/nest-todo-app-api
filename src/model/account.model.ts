export class RegisterAccountRequest {
  username: string;
  email_address: string;
  password: string;
  phone_number: string;
}

export class LoginAccountRequest {
  email_address: string;
  password: string;
}

export class UpdateAccountRequest {
  username?: string;
  email_address?: string;
  phone_number?: string;
  password?: string;
}

export class AccountResponse {
  account_id: string;
  username: string;
  email_address: string;
  phone_number: string;
}
