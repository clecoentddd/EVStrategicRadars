import React from 'react';
import styles from './BIReporting.module.css';
import StrategicTree from './strategic-tree';
import Navbar from "@/components/Navbar";// adjust the path if needed


export default function BIReporting() {
  return (
    <div className={styles.container}>
         <Navbar /> {/* <<=== here you add your Navbar */}
         <h1 className={styles.titlePage}>Strategic Planning Overview - Progress on initiatives</h1>
      <StrategicTree />
    </div>
  );
}