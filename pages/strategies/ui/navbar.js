import React, { useEffect } from "react";
import styles from './navbar.module.css';
import { useRouter } from 'next/router'; // Import useRouter from Next.js

const Navbar = ({ streamAggregate, getRadarUrl }) => {
  const router = useRouter(); // Define router using useRouter hook



  useEffect(() => {
    // Scroll behavior for navbar
    let prevScrollpos = window.scrollY;
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const navbar = document.getElementById("navbar");
      if (navbar) {
        if (prevScrollpos > currentScrollPos) {
          navbar.style.top = "0";
        } else {
          navbar.style.top = "-50px";
        }
        prevScrollpos = currentScrollPos;
      }
    };

    // Attach event listener for scroll
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const goToHome = () => {
    router.push('/'); // Navigate to the home page
  };

  
  const handleRadarClick = () => {
    if (streamAggregate) {
      const radarUrl = getRadarUrl(streamAggregate); 
      router.push(radarUrl); // If using Next.js router
    } else {
      console.error("streamAggregate is undefined");
    }
  };

  const goToStrategize = () => {
    router.push('/strategize'); // Navigate to the strategize page
  };

  return (
    <div id="navbar" className={styles.navbar}>
      <a href="#Radars" onClick={goToHome}>1. Engage</a>
      <a href="#Detect, Assess and Respond" onClick={handleRadarClick}>2. Detect, Assess & Respond</a>
      <a href="#Strategize" onClick={(e) => { e.preventDefault(); goToStrategize(); }}>3. Strategize</a>
    </div>
  );
};

export default Navbar;
