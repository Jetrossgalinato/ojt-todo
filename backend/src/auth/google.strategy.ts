import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'not-configured',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'not-configured',
      callbackURL: `${
        process.env.BACKEND_URL ?? 'http://localhost:4000'
      }/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: unknown, user?: unknown) => void,
  ) {
    try {
      const user = await this.authService.validateGoogleUser({
        email: profile.emails?.[0]?.value ?? '',
        name: profile.displayName ?? null,
      });
      done(null, user);
    } catch (err) {
      done(err as Error, null);
    }
  }
}
