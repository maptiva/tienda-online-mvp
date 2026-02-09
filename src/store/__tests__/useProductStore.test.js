import { useProductStore } from '../useProductStore';

describe('useProductStore', () => {
  beforeEach(() => {
    // Resetear el store antes de cada test
    useProductStore.setState({ productsCache: {} });
  });

  describe('setProducts', () => {
    it('almacena productos para un userId dado', () => {
      const { setProducts } = useProductStore.getState();
      const mockProducts = [
        { id: 1, name: 'Producto A', price: 100 },
        { id: 2, name: 'Producto B', price: 200 },
      ];

      setProducts('user-123', mockProducts);

      const state = useProductStore.getState();
      expect(state.productsCache['user-123']).toBeDefined();
      expect(state.productsCache['user-123'].data).toEqual(mockProducts);
      expect(state.productsCache['user-123'].timestamp).toBeTypeOf('number');
    });

    it('no sobreescribe productos de otros usuarios', () => {
      const { setProducts } = useProductStore.getState();

      setProducts('user-1', [{ id: 1, name: 'A' }]);
      setProducts('user-2', [{ id: 2, name: 'B' }]);

      const state = useProductStore.getState();
      expect(state.productsCache['user-1'].data).toHaveLength(1);
      expect(state.productsCache['user-2'].data).toHaveLength(1);
      expect(state.productsCache['user-1'].data[0].name).toBe('A');
      expect(state.productsCache['user-2'].data[0].name).toBe('B');
    });
  });

  describe('getProducts', () => {
    it('retorna null si no hay cache para el userId', () => {
      const { getProducts } = useProductStore.getState();
      expect(getProducts('inexistente')).toBeNull();
    });

    it('retorna data con isStale=false si el cache es reciente', () => {
      const { setProducts, getProducts } = useProductStore.getState();
      setProducts('user-1', [{ id: 1 }]);

      const result = getProducts('user-1');
      expect(result).not.toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.isStale).toBe(false);
    });

    it('retorna isStale=true si el cache tiene más de 5 minutos', () => {
      // Insertar directamente con timestamp viejo
      useProductStore.setState({
        productsCache: {
          'user-old': {
            data: [{ id: 1 }],
            timestamp: Date.now() - 6 * 60 * 1000, // 6 minutos atrás
          },
        },
      });

      const { getProducts } = useProductStore.getState();
      const result = getProducts('user-old');
      expect(result.isStale).toBe(true);
      expect(result.data).toHaveLength(1); // Aún devuelve la data
    });
  });

  describe('hasProducts', () => {
    it('retorna false si no hay cache', () => {
      const { hasProducts } = useProductStore.getState();
      expect(hasProducts('no-existe')).toBe(false);
    });

    it('retorna true si hay cache', () => {
      const { setProducts, hasProducts } = useProductStore.getState();
      setProducts('user-1', []);
      expect(hasProducts('user-1')).toBe(true);
    });
  });

  describe('findProduct', () => {
    it('encuentra un producto por ID a través de todos los caches', () => {
      useProductStore.setState({
        productsCache: {
          'user-1': { data: [{ id: 10, name: 'Zapato' }], timestamp: Date.now() },
          'user-2': { data: [{ id: 20, name: 'Remera' }], timestamp: Date.now() },
        },
      });

      const { findProduct } = useProductStore.getState();
      const found = findProduct(20);
      expect(found).toBeDefined();
      expect(found.name).toBe('Remera');
    });

    it('retorna null si el producto no existe en ningún cache', () => {
      const { findProduct } = useProductStore.getState();
      expect(findProduct(999)).toBeNull();
    });

    it('acepta productId como string y lo parsea correctamente', () => {
      useProductStore.setState({
        productsCache: {
          'user-1': { data: [{ id: 5, name: 'Test' }], timestamp: Date.now() },
        },
      });

      const { findProduct } = useProductStore.getState();
      expect(findProduct('5')).toBeDefined();
      expect(findProduct('5').name).toBe('Test');
    });
  });
});
