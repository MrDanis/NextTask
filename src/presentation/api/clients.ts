import type { CurrentUserDto } from '@/application/auth/useCases';
import type { SignInInput } from '@/application/auth/validateSignIn';
import type { DrawDto } from '@/application/generator/dto';
import { request } from './http';

export const drawsClient = {
  create: () => request<DrawDto>('/api/draws', { method: 'POST' }),
  claim: (numbers: number[]) =>
    request<DrawDto>('/api/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numbers }),
    }),
};

export const sessionClient = {
  signIn: (input: SignInInput) =>
    request<CurrentUserDto>('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  signOut: () => request<null>('/api/session', { method: 'DELETE' }),
};
