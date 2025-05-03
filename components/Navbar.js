import React, { useEffect, useState } from "react";
import styles from './navbar.module.css';
import { useRouter } from 'next/router';

const Navbar = ({ streamAggregate, getRadarUrl, radarId, sourcePage }) => {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorBanner, setShowErrorBanner] = useState(true);
  const currentPath = router.pathname;

  useEffect(() => {
    let prevScrollpos = window.scrollY;
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const navbar = document.getElementById("navbar");
      if (navbar) {
        navbar.style.top = prevScrollpos > currentScrollPos ? "0" : "-50px";
        prevScrollpos = currentScrollPos;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goToHome = () => {
    router.push('/');
  };

  const handleRadarClick = () => {
    if (radarId) {
      router.push(`/radar/${encodeURIComponent(radarId)}`);
    } else if (streamAggregate && getRadarUrl) {
      const radarUrl = getRadarUrl(streamAggregate);
      router.push(radarUrl);
    } else {
      setErrorMessage("Select an organisation first and use View Radar button to view the radar");
      setHasError(true);
      setShowErrorBanner(true);
    }
  };

  const goToStrategize = async (e) => {
    e.preventDefault();
    if (!radarId) {
      setErrorMessage("Select an organisation first and use View Strategy button to view the strategy");
      setHasError(true);
      setShowErrorBanner(true);
      return;
    }

    try {
      const response = await fetch(`/api/readmodel-strategies?radarId=${radarId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch strategies: ${response.status}`);
      }

      const stream = await response.json();
      const streamID = stream.id;

      if (streamID) {
        router.push(`/strategies/ui/${encodeURIComponent(streamID)}`);
      } else {
        setErrorMessage('You must select an organisation or a radar to strategize');
        setHasError(true);
        setShowErrorBanner(true);
      }
    } catch (error) {
      setErrorMessage(`Error fetching stream: ${error.message}`);
      setHasError(true);
      setShowErrorBanner(true);
    }
  };

  const goToBIReporting = (e) => {
    e.preventDefault();
    router.push('/BIReporting');
  };

  return (
    <>
      {hasError && showErrorBanner && (
        <div className={styles.errorBanner}>
          <span>{errorMessage}</span>
          <button
            onClick={() => setShowErrorBanner(false)}
            className={styles.dismissButton}
          >
            ✖
          </button>
        </div>
      )}

      <div id="navbar" className={styles.navbar}>
        <a
          className={`${styles.navItem} ${currentPath === '/' ? styles.active : ''}`}
          onClick={goToHome}
        >
          1. Engage
        </a>
        <a
          className={`${styles.navItem} ${currentPath.startsWith('/radar') ? styles.active : ''}`}
          onClick={(e) => { e.preventDefault(); handleRadarClick(); }}
        >
          2. Detect, Assess & Respond
        </a>
        <a
          className={`${styles.navItem} ${currentPath.startsWith('/strategies/ui') ? styles.active : ''}`}
          onClick={goToStrategize}
        >
          3. Strategize
        </a>
        <a
          className={`${styles.navItem} ${currentPath === '/BIReporting' ? styles.active : ''}`}
          onClick={goToBIReporting}
        >
          4. BI Reporting
        </a>
      </div>
    </>
  );
};

export default Navbar;
