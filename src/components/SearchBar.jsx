import React from 'react';
import styles from './SearchBar.module.css';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Buscar productos por nombre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />
    </div>
  );
};

export default SearchBar;
