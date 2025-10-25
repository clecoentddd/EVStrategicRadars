import { useRouter } from 'next/router';
import React, { useState, useEffect, useRef } from 'react';
import RadarChart from '@/components/radarChart/RadarChart';
import Navbar from '@/components/Navbar';
import styles from './name.module.css';
import RadarItemEditOrCreateForm, { DEFAULT_FORM_VALUES } from './RadarItemEditOrCreateForm';

import {
  GetRadar,
  GetRadarItems,
  GetRadarConfig,
  GetAllRadars,
} from '../utils/GetRadarData';

export default function RadarPage() {
  const router = useRouter();
  const { name, radarId } = router.query;

  const [radar, setRadar] = useState(null);
  const [radarItems, setRadarItems] = useState([]);
  const [config, setConfig] = useState({});
  const [zoomInOptions, setZoomInOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // form & UI states
  const [formData, setFormData] = useState(DEFAULT_FORM_VALUES);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEditingId, setCurrentEditingId] = useState(null);
  const [collapsedItems, setCollapsedItems] = useState([]);

  const formRef = useRef(null);

  const logMessage = (msg) => console.log(`[RadarPage] ${msg}`);

  // 🔹 Fetch all radar-related data
  useEffect(() => {
    if (!radarId) return;

    async function fetchAll() {
      try {
        setLoading(true);
        setError(null);

        const [radarData, itemsData, configData, allRadars] = await Promise.all([
          GetRadar(radarId),
          GetRadarItems(radarId),
          GetRadarConfig(),
          GetAllRadars(),
        ]);

        setRadar(radarData);
        setRadarItems(itemsData);
        setConfig(configData);
        setZoomInOptions(allRadars.filter((r) => r.id !== radarId));

        setCollapsedItems(new Array(itemsData.length).fill(true));
        logMessage('All radar data fetched successfully');
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [radarId]);

  // 🔹 Handle editing
  const handleEdit = (item) => {
    setEditMode(true);
    setCurrentEditingId(item.id);
    setFormData(item);
    setShowForm(true);
  };

  // 🔹 Handle saving
  const handleSaveItem = async () => {
    const method = editMode ? 'PUT' : 'POST';
    const url = editMode ? `/api/radar-items?id=${currentEditingId}` : `/api/radar-items`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ radarId, ...formData }),
      });

      if (!res.ok) throw new Error('Failed to save radar item');
      const result = await res.json();

      // Refresh radar items
      const items = await GetRadarItems(radarId);
      setRadarItems(items);

      // Reset form
      setShowForm(false);
      setEditMode(false);
      setCurrentEditingId(null);
      setFormData(DEFAULT_FORM_VALUES);

      logMessage('Radar item saved successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading radar...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!radar) return <p>No radar found</p>;

  return (
    <div>
      <Navbar radarId={radarId} />

      <div className={styles.container}>
        <div className={styles.radarDetails}>
          <h1 className={styles.radarName}>{radar.name}</h1>
          <p>{radar.detect}</p>
          <p>{radar.category}</p>
        </div>
      </div>

      <div className={styles.radarChart}>
        <div className={styles.leftPanel}>
          <button
            onClick={() => {
              setShowForm(true);
              setEditMode(false);
              setFormData(DEFAULT_FORM_VALUES);
            }}
            className={styles.createButton}
          >
            Create Radar Item
          </button>
        </div>

        <div className={styles.chartArea}>
          <RadarChart items={radarItems} radius={280} onEditClick={handleEdit} />
        </div>
      </div>

      <h2 className={styles.radarItemsTitle}>Radar Items</h2>

      {showForm && (
        <div className={`${styles.sliderForm} ${showForm ? styles.sliderFormVisible : ''}`}>
          <RadarItemEditOrCreateForm
            showForm={showForm}
            editMode={editMode}
            formData={formData}
            typeOptions={Object.values(config.typeOptions || {})}
            categoryOptions={Object.values(config.categoryOptions || {})}
            zoomInOptions={zoomInOptions}
            handleInputChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            handleSaveItem={handleSaveItem}
            setShowForm={setShowForm}
          />
        </div>
      )}

      <ul className={styles.radarItemList}>
        {radarItems.map((item, idx) => (
          <li
            key={item.id}
            className={`${styles.radarItem} ${
              collapsedItems[idx] ? styles.collapsed : styles.expanded
            }`}
            onClick={() =>
              setCollapsedItems((prev) => {
                const newArr = [...prev];
                newArr[idx] = !newArr[idx];
                return newArr;
              })
            }
          >
            <h3>
              {item.name} ({item.category})
            </h3>
            {!collapsedItems[idx] && (
              <div className={styles.collapsedContent}>
                <p><strong>Detect</strong>: {item.detect}</p>
                <p>Type: {item.type}</p>
                <p>Category: {item.category}</p>
                <p>Distance: {item.distance}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                  className={styles.editButton}
                >
                  Edit
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
