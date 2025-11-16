import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-orange-400 transition-all">
      <input
        className="w-full outline-none bg-transparent text-lg placeholder-gray-500"
        type="text"
        placeholder="Buscar productos por nombre..."
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
