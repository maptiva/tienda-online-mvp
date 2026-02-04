import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import styles from './ClicandoBrandButton.module.css';
import logo from '../assets/logo-clicando.png';
import { FaChevronRight } from 'react-icons/fa';

// --- Hooks ---
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

const usePortalContainer = (isDesktop) => {
  const [container, setContainer] = useState(null);

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
const MobileButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`${styles.mobileContainer} ${isOpen ? styles.open : ''}`}
      onClick={() => setIsOpen(!isOpen)} // This will always fire, toggling the state
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
            // If the drawer is closed, this click's only job is to open it.
            // The parent div's onClick handles the state change.
            // We prevent the Link's default navigation behavior.
            e.preventDefault();
          } else {
            // If the drawer is already open, proceed with navigation.
            window.scrollTo(0, 0);
          }
        }}
      >
        <img src={logo} alt="Volver a Clicando" className={styles.logo} />
      </Link>
    </div>
  );
};

const DesktopButton = () => (
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
const ClicandoBrandButton = () => {
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