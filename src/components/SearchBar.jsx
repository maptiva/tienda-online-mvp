import { FiSearch } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const SearchBar = ({ searchTerm, setSearchTerm, placeholder = "Buscar productos por nombre..." }) => {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-orange-400 transition-all border border-gray-300">
      <input
        className="w-full outline-none bg-transparent text-lg text-gray-900 placeholder-gray-500"
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <span className="text-gray-500 text-2xl">
        <FiSearch />
      </span>
    </div>
  );
};

export default SearchBar;
