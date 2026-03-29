import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import styles from './ClicandoBrandButton.module.css';
import logo from '../assets/logo-clicando.png';
import { FaChevronRight } from 'react-icons/fa';

// --- Hooks ---
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

const usePortalContainer = (isDesktop: boolean): HTMLElement | null => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isDesktop) {
      const portalContainer = document.getElementById('clicando-brand-button-container');
      setContainer(portalContainer);
    } else {
      setContainer(null);
    }
  }, [isDesktop]);

  return container;
};

// --- Sub-components ---
const MobileButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`${styles.mobileContainer} ${isOpen ? styles.open : ''}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className={styles.handle}>
        <FaChevronRight className={styles.chevron} />
      </div>
      <Link
        to="/"
        className={styles.logoLink}
        title="Volver a Clicando"
        onClick={(e) => {
          if (!isOpen) {
            e.preventDefault();
          } else {
            window.scrollTo(0, 0);
          }
        }}
      >
        <img src={logo} alt="Volver a Clicando" className={styles.logo} />
      </Link>
    </div>
  );
};

const DesktopButton: React.FC = () => (
  <Link
    to="/"
    className={styles.desktopButton}
    title="Volver a Clicando"
    onClick={() => window.scrollTo(0, 0)}
  >
    <img src={logo} alt="Volver a Clicando" className={styles.logo} />
  </Link>
);


// --- Main Component ---
const ClicandoBrandButton: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 769px)');
  const portalContainer = usePortalContainer(isDesktop);

  if (isDesktop) {
    if (portalContainer) {
      return createPortal(<DesktopButton />, portalContainer);
    }
    return null; // Don't render anything if portal target isn't found
  }

  return <MobileButton />;
};

export default ClicandoBrandButton;