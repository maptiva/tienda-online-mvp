import { describe, it, expect } from 'vitest';
import { isSuperAdmin, SUPER_ADMIN_EMAILS } from '../authRoles';
import { User } from '@supabase/supabase-js';

describe('isSuperAdmin', () => {
  it('retorna true para un email de super admin', () => {
    const user = { email: SUPER_ADMIN_EMAILS[0] } as User;
    expect(isSuperAdmin(user)).toBe(true);
  });

  it('retorna false para un email no autorizado', () => {
    const user = { email: 'usuario@random.com' } as User;
    expect(isSuperAdmin(user)).toBe(false);
  });

  it('retorna false si el usuario es null', () => {
    expect(isSuperAdmin(null)).toBe(false);
  });

  it('retorna false si el usuario es undefined', () => {
    // @ts-ignore - Probar comportamiento en runtime para JS legacy
    expect(isSuperAdmin(undefined)).toBe(false);
  });

  it('retorna false si el usuario no tiene email', () => {
    expect(isSuperAdmin({} as User)).toBe(false);
    expect(isSuperAdmin({ name: 'Test' } as unknown as User)).toBe(false);
  });

  it('retorna false si el email es null', () => {
    expect(isSuperAdmin({ email: null } as unknown as User)).toBe(false);
  });
});
