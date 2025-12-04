import { FiSearch } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const SearchBar = ({ searchTerm, setSearchTerm, placeholder = "Buscar productos..." }) => {
  const { theme } = useTheme();

  return (
    <div
      className="relative w-full"
      style={{
        maxWidth: '600px' // Limitar ancho máximo
      }}
    >
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-xl"
        style={{ color: '#64748b' }} // Gris medio para el icono en ambos temas
      >
        <FiSearch />
      </span>
      <input
        className="w-full pl-10 pr-4 py-2.5 rounded-full outline-none transition-all text-sm"
        style={{
          backgroundColor: '#ffffff', // Blanco en ambos temas
          color: '#1e293b', // Texto oscuro en ambos temas
          border: `1px solid var(--color-border)`,
        }}
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-primary)';
          e.target.style.boxShadow = `0 0 0 3px ${theme === 'light' ? 'rgba(95, 175, 184, 0.2)' : 'rgba(56, 189, 248, 0.2)'}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-border)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
};

export default SearchBar;
