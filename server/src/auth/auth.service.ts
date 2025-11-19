import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient;
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;

  constructor(private configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    this.supabaseKey = this.configService.get<string>('SUPABASE_KEY') || '';

    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error(
        'Supabase URL and Key must be configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables.',
      );
    }

    this.supabase = createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async register(registerDto: RegisterDto) {
    const { email, password, passwordConfirm } = registerDto;

    // Validate password confirmation
    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // Provide more helpful error messages
        if (error.message.includes('API key')) {
          throw new BadRequestException(
            'Invalid Supabase configuration. Please check your SUPABASE_KEY environment variable.',
          );
        }
        throw new BadRequestException(error.message);
      }

      return {
        user: {
          email: data.user?.email,
          id: data.user?.id,
          plan: 'free', // Default plan, will be updated when Stripe integration is added
        },
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Provide more helpful error messages
        if (error.message.includes('API key')) {
          throw new UnauthorizedException(
            'Invalid Supabase configuration. Please check your SUPABASE_KEY environment variable.',
          );
        }
        throw new UnauthorizedException(error.message);
      }

      return {
        user: {
          email: data.user?.email,
          id: data.user?.id,
          plan: 'free', // Default plan, will be updated when Stripe integration is added
        },
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  async getCurrentUser(accessToken: string) {
    try {
      // Create a new Supabase client with the access token
      const supabaseClient = createClient(this.supabaseUrl, this.supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const { data, error } = await supabaseClient.auth.getUser();

      if (error || !data.user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      return {
        email: data.user.email,
        id: data.user.id,
        plan: 'free', // Default plan, will be updated when Stripe integration is added
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to get user');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${this.configService.get<string>('CLIENT_URL') || 'http://localhost:5173'}/reset-password`,
    });

    // Always return success message for security (don't reveal if email exists)
    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, passwordConfirm } = resetPasswordDto;

    // Validate password confirmation
    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    try {
      // Use Supabase REST API directly for password reset
      // Recovery tokens need to be used with the REST API endpoint
      this.logger.log('Attempting to reset password using recovery token');
      this.logger.debug('Token length:', token?.length || 0);

      // Call Supabase REST API directly to update password
      // This avoids the "Auth session missing" error by using the token directly
      const response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          apikey: this.supabaseKey,
        },
        body: JSON.stringify({
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.logger.error('Password update error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        const errorMessage =
          errorData.message ||
          errorData.error_description ||
          `Failed to update password (${response.status})`;

        // Check for token-related errors
        if (
          errorMessage.toLowerCase().includes('jwt') ||
          errorMessage.toLowerCase().includes('token') ||
          errorMessage.toLowerCase().includes('session')
        ) {
          throw new BadRequestException(
            'Invalid or expired reset token. Please request a new password reset link.',
          );
        }

        throw new BadRequestException(errorMessage);
      }

      const data = await response.json();

      // Get user info to return
      const userInfo = data.user || data;

      return {
        message: 'Password has been reset successfully',
        user:
          userInfo?.email && userInfo?.id
            ? {
                email: userInfo.email,
                id: userInfo.id,
                plan: 'free', // Default plan, will be updated when Stripe integration is added
              }
            : null,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Password reset error:', error);
      throw new BadRequestException(
        'Password reset failed. Please try again or request a new reset link.',
      );
    }
  }
}
