import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { FaStore, FaTimes, FaSearch } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import styles from './StoreDirectory.module.css';

// Componente individual de tarjeta de tienda
const StoreCard = ({ store }) => {
    const { theme } = useTheme();

    const CardWrapper = store.coming_soon ? 'div' : Link;
    const cardProps = store.coming_soon
        ? {}
        : { to: `/${store.store_slug}` };

    return (
        <CardWrapper
            {...cardProps}
            className={`${styles.card} ${theme === 'dark' ? styles.darkCard : ''
                } ${store.coming_soon ? styles.comingSoonCard : ''}`}
        >
            <div className={styles.cardHeader}>
                {store.logo_url ? (
                    <img
                        src={store.logo_url}
                        alt={store.store_name}
                        className={styles.logo}
                    />
                ) : (
                    <div className={styles.logoPlaceholder}>
                        <FaStore />
                    </div>
                )}
                {store.is_demo && (
                    <span className={styles.demoBadge}>DEMO</span>
                )}
                {store.coming_soon && !store.is_demo && (
                    <span className={styles.comingSoonBadge}>PRÓXIMAMENTE</span>
                )}
            </div>
            <div className={styles.cardBody}>
                <h3 className={styles.storeName}>{store.store_name}</h3>
                {store.category && (
                    <span className={styles.category}>{store.category}</span>
                )}
                {store.coming_soon ? (
                    <span className={styles.disabledLink}>No disponible</span>
                ) : (
                    <span className={styles.visitLink}>Visitar Tienda →</span>
                )}
            </div>
        </CardWrapper>
    );
};

// Componente principal del Directorio (Modal)
const StoreDirectory = ({ isOpen, onClose }) => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { theme } = useTheme();

    useEffect(() => {
        if (isOpen) {
            fetchStores();
        }
    }, [isOpen]);

    const fetchStores = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('stores')
                .select('id, store_name, store_slug, logo_url, is_demo, coming_soon, is_active, created_at, category')
                .or('is_active.eq.true,coming_soon.eq.true');

            if (error) throw error;

            // Custom sorting logic
            const getStoreRank = (store) => {
                if (store.is_active && !store.is_demo && !store.coming_soon) {
                    return 1; // Active and not demo/coming soon
                }
                if (store.is_demo) {
                    return 2; // Demo
                }
                if (store.coming_soon) {
                    return 3; // Coming soon
                }
                return 4; // Others
            };

            const sortedData = (data || []).sort((a, b) => {
                const rankA = getStoreRank(a);
                const rankB = getStoreRank(b);

                if (rankA !== rankB) {
                    return rankA - rankB;
                }

                // Secondary sort by creation date (newest first)
                if (a.created_at && b.created_at) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }

                return 0;
            });

            setStores(sortedData);
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStores = stores.filter(store => {
        const searchLower = searchTerm.toLowerCase();
        return (
            store.store_name.toLowerCase().includes(searchLower) ||
            (store.category && store.category.toLowerCase().includes(searchLower))
        );
    });

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={`${styles.modal} ${theme === 'dark' ? styles.darkModal : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <button className={styles.closeButton} onClick={onClose}>
                    <FaTimes />
                </button>

                <div className={styles.header}>
                    <h2>Tiendas Clicando</h2>
                    <p>Descubre otros emprendedores que confían en nosotros</p>
                </div>

                <div className={styles.searchContainer}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Buscar tienda..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loading}>Cargando tiendas...</div>
                    ) : filteredStores.length > 0 ? (
                        <div className={styles.grid}>
                            {filteredStores.map(store => (
                                <StoreCard key={store.id} store={store} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            <p>No se encontraron tiendas con ese nombre.</p>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <p>¿Querés tu propia tienda? <Link to="/" onClick={onClose}>Te esperamos en Clicando</Link></p>
                </div>
            </div>
        </div>
    );
};

export default StoreDirectory;
