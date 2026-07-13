<<<<<<< feature_007/auth-register
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
=======
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
>>>>>>> development
  email!: string;
}