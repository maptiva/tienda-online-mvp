import { isSuperAdmin, SUPER_ADMIN_EMAILS } from '../authRoles';

describe('isSuperAdmin', () => {
  it('retorna true para un email de super admin', () => {
    const user = { email: SUPER_ADMIN_EMAILS[0] };
    expect(isSuperAdmin(user)).toBe(true);
  });

  it('retorna false para un email no autorizado', () => {
    const user = { email: 'usuario@random.com' };
    expect(isSuperAdmin(user)).toBe(false);
  });

  it('retorna false si el usuario es null', () => {
    expect(isSuperAdmin(null)).toBe(false);
  });

  it('retorna false si el usuario es undefined', () => {
    expect(isSuperAdmin(undefined)).toBe(false);
  });

  it('retorna false si el usuario no tiene email', () => {
    expect(isSuperAdmin({})).toBe(false);
    expect(isSuperAdmin({ name: 'Test' })).toBe(false);
  });

  it('retorna false si el email es null', () => {
    expect(isSuperAdmin({ email: null })).toBe(false);
  });
});
