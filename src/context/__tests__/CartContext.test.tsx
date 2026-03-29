import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider, useCart } from '../CartContext';

// Helper: wrapper que provee CartProvider + MemoryRouter con ruta inicial
const createWrapper = (initialRoute = '/mi-tienda') => {
  return ({ children }) => (
    <MemoryRouter initialEntries={[initialRoute]}>
      <CartProvider>{children}</CartProvider>
    </MemoryRouter>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('estado inicial', () => {
    it('el carrito empieza vacío en una ruta de tienda', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper('/mi-tienda'),
      });

      expect(result.current.cart).toEqual([]);
    });

    it('el carrito está vacío en rutas reservadas (login, admin, etc.)', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper('/login'),
      });

      expect(result.current.cart).toEqual([]);
    });
  });

  describe('addToCart', () => {
    it('agrega un producto al carrito', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper('/mi-tienda'),
      });

      act(() => {
        result.current.addToCart({ id: 1, name: 'Zapato', price: 5000 }, 2);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].product.name).toBe('Zapato');
      expect(result.current.cart[0].quantity).toBe(2);
    });

    it('incrementa la cantidad si el producto ya existe', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper('/mi-tienda'),
      });

      act(() => {
        result.current.addToCart({ id: 1, name: 'Zapato', price: 5000 }, 2);
      });

      act(() => {
        result.current.addToCart({ id: 1, name: 'Zapato', price: 5000 }, 3);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(5);
    });

    it('no agrega productos en rutas reservadas', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper('/admin'),
      });

      act(() => {
        result.current.addToCart({ id: 1, name: 'Test' }, 1);
      });

      expect(result.current.cart).toEqual([]);
    });
  });

  describe('removeFromCart', () => {
    it('elimina un producto del carrito por ID', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper('/mi-tienda'),
      });

      act(() => {
        result.current.addToCart({ id: 1, name: 'A' }, 1);
        result.current.addToCart({ id: 2, name: 'B' }, 1);
      });

      act(() => {
        result.current.removeFromCart(1);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].product.id).toBe(2);
    });
  });

  describe('clearCart', () => {
    it('vacía el carrito de la tienda actual', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper('/mi-tienda'),
      });

      act(() => {
        result.current.addToCart({ id: 1, name: 'A' }, 1);
        result.current.addToCart({ id: 2, name: 'B' }, 3);
      });

      expect(result.current.cart).toHaveLength(2);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cart).toEqual([]);
    });
  });

  describe('persistencia en localStorage', () => {
    it('persiste el carrito en localStorage', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper('/mi-tienda'),
      });

      act(() => {
        result.current.addToCart({ id: 1, name: 'Persistido' }, 1);
      });

      const stored = JSON.parse(localStorage.getItem('clicando_multi_carts'));
      expect(stored).toBeDefined();
      expect(stored['mi-tienda']).toBeDefined();
      expect(stored['mi-tienda']).toHaveLength(1);
    });
  });

  describe('multi-tenant (carritos separados por tienda)', () => {
    it('mantiene carritos separados por slug de tienda', () => {
      // Simular que hay datos de otra tienda en localStorage
      localStorage.setItem(
        'clicando_multi_carts',
        JSON.stringify({
          'otra-tienda': [{ product: { id: 99, name: 'Otro' }, quantity: 1 }],
        })
      );

      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper('/mi-tienda'),
      });

      // El carrito de mi-tienda debe estar vacío
      expect(result.current.cart).toEqual([]);

      // Agregar algo a mi-tienda no debe afectar otra-tienda
      act(() => {
        result.current.addToCart({ id: 1, name: 'Mío' }, 1);
      });

      const stored = JSON.parse(localStorage.getItem('clicando_multi_carts'));
      expect(stored['otra-tienda']).toHaveLength(1);
      expect(stored['mi-tienda']).toHaveLength(1);
    });
  });
});
