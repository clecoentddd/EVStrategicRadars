import { useRouter } from 'next/router';
import React, { useState, useEffect, useRef } from 'react';
import RadarChart from '@/components/radarChart/RadarChart';
import Navbar from '@/components/Navbar';
import styles from './name.module.css';
import RadarItemEditOrCreateForm from './RadarItemEditOrCreateForm';
import { DEFAULT_FORM_VALUES } from './RadarItemEditOrCreateForm';

export default function RadarPage() {
  const [radar, setRadar] = useState(null);
  const [radarItems, setRadarItems] = useState([]);
  const [loadingRadar, setLoadingRadar] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState(DEFAULT_FORM_VALUES);

  const [zoomInOptions, setZoomInOptions] = useState([]);
  const [impactOptions, setImpactOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [toleranceOptions, setToleranceOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [distanceOptions, setDistanceOptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEditingId, setCurrentEditingId] = useState(null);
  const [logs, setLogs] = useState([]);
  const router = useRouter();
  const { name, radarId } = router.query;
  const [collapsedItems, setCollapsedItems] = useState([]);

  const formRef = useRef(null);

  useEffect(() => {
    if (radarItems.length > 0) {
      setCollapsedItems(new Array(radarItems.length).fill(true));
    }
  }, [radarItems]);

  const fetchRadar = async () => {
    try {
      setLoadingRadar(true);
      setError(null);
      logMessage("Fetching radar data...");

      const response = await fetch(`/api/organisations-fetch?id=${radarId}`);
      const data = await response.json();

      if (response.ok) {
        setRadar(data);
        setCollapsedItems(new Array(data.length).fill(true));
        logMessage("Radar data fetched successfully");
      } else {
        setError(data.message);
        logMessage(`Error fetching radar data: ${data.message}`);
      }
    } catch (err) {
      setError('Error fetching radar');
      logMessage("Error fetching radar data");
    } finally {
      setLoadingRadar(false);
    }
  };

  useEffect(() => {
    if (!radarId) return;

    fetchRadar();

    const fetchRadarItems = async () => {
      try {
        logMessage("Fetching radar items...");
        const response = await fetch(`/api/radar-items?radarId=${radarId}`);
        const data = await response.json();

        if (response.ok) {
          setRadarItems(data);
          logMessage("Radar items fetched successfully");
        } else {
          setError(data.message);
          logMessage(`Error fetching radar items: ${data.message}`);
        }
      } catch (err) {
        setError('Error fetching radar items');
        logMessage("Error fetching radar items");
      } finally {
        setLoadingItems(false);
      }
    };

    const fetchZoomInOptions = async () => {
      try {
        const response = await fetch(`/api/organisations-fetch`);
        const radars = await response.json();

        if (response.ok) {
          setZoomInOptions(radars.filter((radarItem) => radarItem.id !== radarId));
        }
      } catch (err) {
        setError('Error fetching radar options for zoom-in');
        logMessage("Error fetching radar options for zoom-in");
      }
    };

    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/radar_config');
        const data = await response.json();

        const distanceOptions = Object.values(data.distanceOptions);
        const impactOptions = Object.values(data.impactOptions);
        const typeOptions = Object.values(data.typeOptions);
        const categoryOptions = Object.values(data.categoryOptions);
        const toleranceOptions = Object.values(data.toleranceOptions);

        setImpactOptions(impactOptions);
        setTypeOptions(typeOptions);
        setToleranceOptions(toleranceOptions);
        setCategoryOptions(categoryOptions);
        setDistanceOptions(distanceOptions);
      } catch (error) {
        logMessage(` Error fetching config: ${error}`);
      }
    };

    fetchConfig();
    fetchRadarItems();
    fetchZoomInOptions();
  }, [radarId]);

  const logMessage = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("handleInputChange: ", name, value);
    setFormData(prev => ({
      ...DEFAULT_FORM_VALUES,
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = async (item) => {
    try {
      setEditMode(true);
      setCurrentEditingId(item.id);
      setShowForm(true);

      const response = await fetch(`/api/radar-items?radarId=${item.radarId}&id=${item.id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(`Failed to fetch radar item: ${errorText}`);
        return;
      }

      const rawResponseText = await response.text();
      const radarItem = JSON.parse(rawResponseText);

      if (radarItem.success === false) {
        setError(radarItem.message);
        return;
      }

      setFormData({
        name: radarItem.name || '',
        detect: radarItem.detect || '',
        assess: radarItem.assess || '',
        respond: radarItem.respond || '',
        category: radarItem.category || '',
        type: radarItem.type || '',
        distance: radarItem.distance || '',
        impact: radarItem.impact || '',
        tolerance: radarItem.tolerance || '',
        zoom_in: radarItem.zoom_in || '',
      });
    } catch (error) {
      setError('Error fetching radar item for edit');
    }
  };

  const toggleCollapse = (index) => {
    setCollapsedItems((prevCollapsedItems) => {
      const updatedCollapsedItems = [...prevCollapsedItems];
      updatedCollapsedItems[index] = !prevCollapsedItems[index];
      return updatedCollapsedItems;
    });
  };

  const handleSaveItem = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `/api/radar-items?id=${currentEditingId}` : `/api/radar-items`;

      const command = {
        radarId,
        ...formData,
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return;
      }

      const rawResponseText = await response.text();
      const responseData = JSON.parse(rawResponseText);
      const radarItem = responseData.data;

      setRadarItems(prevRadarItems => {
        if (editMode) {
          return prevRadarItems.map(item =>
            item.id === currentEditingId ? radarItem : item
          );
        } else {
          return [radarItem, ...prevRadarItems];
        }
      });

      setShowForm(false);
      setEditMode(false);
      setCurrentEditingId(null);
      setFormData({
        name: '',
        detect: '',
        assess: '',
        respond: '',
        category: '',
        type: '',
        distance: '',
        impact: '',
        tolerance: '',
        zoom_in: '',
      });

      await fetchRadar();
    } catch (err) {
      console.log("Error saving radar item", err);
    }
  };

  if (loadingRadar || loadingItems) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!radar) return <p>No radar found</p>;

  return (
    <div>
      <Navbar radarId={radarId} />

      <div className={styles.container}>
        {loadingRadar && <p>Loading radar details...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loadingRadar && radar && (
          <>
            <div className={styles.radarDetails}>
              <h1 className={styles.radarName}>{radar.name}</h1>
              <p className={styles.detect}>{radar.detect}</p>
              <p className={styles.detect}>{radar.category}</p>
            </div>
          </>
        )}
      </div>

      <div className={styles.radarChart}>
  <div className={styles.leftPanel}>
    <button
      onClick={() => {
        setShowForm(true);
        setEditMode(false);
        setCurrentEditingId(null);
        setFormData(DEFAULT_FORM_VALUES);
      }}
      className={styles.createButton}
    >
      Create Radar Item
    </button>
    {/* You can add the tooltip here later */}
  </div>

  <div className={styles.chartArea}>
    <RadarChart items={radarItems} radius={280} onEditClick={handleEdit} />
  </div>
</div>


      <h2 className={styles.radarItemsTitle}>Radar Items</h2>
      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            setEditMode(false);
            setCurrentEditingId(null);
            setFormData(DEFAULT_FORM_VALUES);
          }}
          className={styles.createButton}
        >
          Create Radar Item
        </button>
      )}

      {showForm && (
        <div className={`${styles.sliderForm} ${showForm ? styles.sliderFormVisible : ''}`}>
          <RadarItemEditOrCreateForm
            showForm={showForm || DEFAULT_FORM_VALUES}
            editMode={editMode}
            formData={formData}
            typeOptions={typeOptions}
            categoryOptions={categoryOptions}
            zoomInOptions={zoomInOptions}
            handleInputChange={handleInputChange}
            handleSaveItem={handleSaveItem}
            setShowForm={setShowForm}
          />
        </div>
      )}

      <ul className={styles.radarItemList}>
        {radarItems.length === 0 ? (
          <li>No radar items yet</li>
        ) : (
          radarItems.map((item, index) => (
            <li
              key={item.id}
              className={`${styles.radarItem} ${
                collapsedItems[index] ? styles.collapsed : styles.expanded
              }`}
              onClick={() => toggleCollapse(index)}
            >
              <h3>
                {item.name} ({item.category})
              </h3>

              {!collapsedItems[index] && (
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
          ))
        )}
      </ul>
    </div>
  );
}
