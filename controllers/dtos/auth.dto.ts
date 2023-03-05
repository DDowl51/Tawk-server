export interface RegisterDto {
  name: string;
  email: string;
  avatar?: string;
  password: string;
}

export interface VerifyOTPDto {
  email: string;
  otp: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
