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

  // Form & UI states
  const [formData, setFormData] = useState(DEFAULT_FORM_VALUES);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEditingId, setCurrentEditingId] = useState(null);
  const [collapsedItems, setCollapsedItems] = useState([]);

  const formRef = useRef(null);

  // 🔹 Fetch radar data
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
  const handleEdit = async (item) => {
    setEditMode(true);
    setCurrentEditingId(item.id);
    setShowForm(true);

    try {
      const res = await fetch(`/api/radar-items?id=${item.id}`);
      const fullItem = await res.json();

      setFormData({
        id: fullItem.id,
        name: fullItem.name || '',
        type: fullItem.type || '',
        category: fullItem.category || '',
        distance: fullItem.distance || '',
        impact: fullItem.impact || '',
        tolerance: fullItem.tolerance || '',
        assess: fullItem.assess || '',
        detect: fullItem.detect || '',
        respond: fullItem.respond || '',
        zoom_in: fullItem.zoom_in || '',
      });
    } catch (err) {
      console.error('Failed to fetch full radar item:', err);
    }
  };

  const handleCreate = () => {
    setFormData(DEFAULT_FORM_VALUES);
    setEditMode(false);
    setCurrentEditingId(null);
    setShowForm(true);
  };

  // 🔹 Handle saving
  const handleSaveItem = async () => {
    const method = editMode ? 'PUT' : 'POST';
    const url = editMode ? `/api/radar-items?id=${currentEditingId}` : `/api/radar-items`;

    console.log(`[Save] Starting ${method} request to: ${url}`);
    console.log('[Save] Payload data:', JSON.stringify({ radarId, ...formData }));

    try {
        const payload = { radarId, ...formData };

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error('[Save] API response failed:', res.status, res.statusText);
            throw new Error(`Failed to save radar item (Status: ${res.status})`);
        }

        const responseBody = await res.json();
        
        // 🎯 FIX 1: Check if the response has a 'data' property and use it.
        const savedItem = responseBody.data || responseBody;
        console.log('[Save] API Success. Permanent Item Data:', savedItem);


        if (editMode) {
            // OPTIMISTIC UI UPDATE: EDIT MODE
            setRadarItems(prev => {
                const updatedItems = prev.map(item => {
                    if (item.id === currentEditingId) {
                        const updatedItem = {
                            ...item,
                            ...formData,
                            id: item.id
                        };
                        console.log(`[Save] Optimistic Update (PUT) for ID ${currentEditingId}:`, updatedItem);
                        return updatedItem;
                    }
                    return item;
                });
                return updatedItems;
            });
        } else {
            // OPTIMISTIC UI UPDATE: CREATE MODE (FIXED REGRESSION)
            
            // 🎯 FIX 2: Ensure savedItem.id is valid before creation.
            if (!savedItem || !savedItem.id) {
                console.error("[Save] Creation failed: Server response did not contain a permanent 'id'. Using fallback refresh.");
                // Fallback: Force a full re-fetch of items
                const itemsData = await GetRadarItems(radarId);
                setRadarItems(itemsData);
            } else {
                const newItem = { 
                    ...savedItem, 
                    ...formData, 
                    id: savedItem.id, 
                };
                
                setRadarItems(prev => [...prev, newItem]);
                console.log(`[Save] Optimistic Creation (POST) successful. Permanent ID: ${newItem.id}`);
            }
        }

        // Clean up UI state
        setShowForm(false);
        setEditMode(false);
        setCurrentEditingId(null);
        setFormData(DEFAULT_FORM_VALUES);
        console.log('[Save] UI state reset.');
        
    } catch (err) {
        console.error('[Save] Final Error saving radar item:', err.message, err);
        setError(err.message);
    }
};

  if (loading) return <p>Loading radar...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!radar) return <p>No radar found</p>;

  return (
    <div>
      <Navbar radarId={radarId} />

      {/* Radar Details */}
      <div className={styles.container}>
        <div className={styles.radarDetails}>
          <h1 className={styles.radarName}>{radar.name}</h1>
          <p>{radar.detect}</p>
          <p>{radar.category}</p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className={styles.radarChart}>
        <RadarChart
          items={radarItems}
          radius={280}
          onEditClick={handleEdit}
          onCreateClick={handleCreate}
        />
      </div>

      {/* Radar Items List */}
      <h2 className={styles.radarItemsTitle}>Radar Items</h2>
      <ul className={styles.radarItemList}>
        {radarItems.map((item, idx) => (
          <li
            key={item.id}
            className={`${styles.radarItem} ${collapsedItems[idx] ? styles.collapsed : styles.expanded}`}
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

      {/* Slider Form */}
      {showForm && (
        <div className={`${styles.sliderForm} ${showForm ? styles.sliderFormVisible : ''}`}>
          <RadarItemEditOrCreateForm
            showForm={showForm}
            editMode={editMode}
            formData={formData}
            typeOptions={Object.values(config.typeOptions || {})}
            categoryOptions={Object.values(config.categoryOptions || {})}
            zoomInOptions={zoomInOptions}
            handleInputChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            handleSaveItem={handleSaveItem}
            setShowForm={setShowForm}
          />
        </div>
      )}
    </div>
  );
}