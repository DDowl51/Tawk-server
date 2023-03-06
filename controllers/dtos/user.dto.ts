export interface CreateUserDto {
  name: string;
  email: string;
  avatar?: string;
  password: string;
}

export interface SearchUserDto {
  pattern: string;
}
