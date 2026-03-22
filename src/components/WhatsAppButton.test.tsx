import { render, screen } from '@testing-library/react';
import WhatsAppButton from './WhatsAppButton';

describe('WhatsAppButton', () => {
  test('no renderiza si no hay phoneNumber', () => {
    const { container } = render(<WhatsAppButton />);
    expect(container.firstChild).toBeNull();
  });

  test('renderiza el enlace con mensaje por defecto', () => {
    render(<WhatsAppButton phoneNumber="123456789" />);
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://wa.me/123456789?text=Hola%2C%20estoy%20interesado%20en%20sus%20productos.');
    expect(link).toHaveAttribute('target', '_blank');
  });

  test('renderiza el enlace con mensaje personalizado', () => {
    const customMessage = 'Mensaje personalizado';
    render(<WhatsAppButton phoneNumber="123456789" customMessage={customMessage} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `https://wa.me/123456789?text=${encodeURIComponent(customMessage)}`);
  });
});
