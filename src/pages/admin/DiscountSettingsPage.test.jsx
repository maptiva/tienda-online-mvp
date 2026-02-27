import { render, screen, waitFor } from '@testing-library/react';
import DiscountSettingsPage from './DiscountSettingsPage';
import { MemoryRouter } from 'react-router-dom';

// Mock completo de todas las dependencias
vi.mock('../../services/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                        data: {
                            discount_settings: {
                                enabled: true,
                                cash_discount: 10,
                                transfer_discount: 15
                            }
                        },
                        error: null
                    })
                }))
            }))
        }))
    }
}));

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(() => ({ user: { id: 'test-user' } })),
    AuthProvider: vi.fn(({ children }) => children)
}));

vi.mock('../../hooks/useCurrentStore', () => ({
    useCurrentStore: vi.fn(() => ({ storeId: 1, loading: false }))
}));

describe('DiscountSettingsPage', () => {
    test('debería renderizar la página de descuentos', async () => {
        render(
            <MemoryRouter>
                <DiscountSettingsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Configuración de Descuentos/i)).toBeInTheDocument();
        });
    });
});
