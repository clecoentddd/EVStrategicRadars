import React, { useEffect, useState } from 'react';
import { supabase } from "../../../utils/supabaseClient";
import styles from './RelatedInitiatives.module.css'; // Import the CSS module

const RelatedInitiatives = ({ initiativeId }) => {
  const [related, setRelated] = useState([]);
  const [allInitiatives, setAllInitiatives] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLinks();
    fetchAllInitiatives();
  }, [initiativeId]);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('initiative_links')
      .select(`
        id,
        target_initiative_id,
        projection_initiatives!target_initiative_id(id, name)
      `)
      .eq('source_initiative_id', initiativeId);

    if (error) {
      console.error('Error fetching links:', error);
    } else {
      setRelated(data);
    }
  };

  const fetchAllInitiatives = async () => {
    const { data, error } = await supabase
      .from('projection_initiatives')
      .select('id, name')
      .neq('id', initiativeId); // prevent linking to self

    if (error) console.error(error);
    else setAllInitiatives(data);
  };

  const addLink = async () => {
    if (!selectedId) return;
    
    setLoading(true);
    const { error } = await supabase.from('initiative_links').insert([ 
      { source_initiative_id: initiativeId, target_initiative_id: selectedId },
    ]);
    if (error) {
      alert('Error linking initiative');
    } else {
      setSelectedId('');
      fetchLinks(); // refresh
    }
    setLoading(false);
  };

  const removeLink = async (linkId) => {
    if (!window.confirm('Are you sure you want to remove this link?')) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('initiative_links')
      .delete()
      .eq('id', linkId);

    if (error) {
      alert('Error removing link');
    } else {
      fetchLinks(); // refresh
    }
    setLoading(false);
  };

  return (
    <div className={styles['related-initiatives-container']}> {/* Apply styles using the CSS module */}
      <h4 className={styles['related-initiatives-title']}>Related Initiatives</h4>

      {related.length === 0 ? (
        <p className={styles['related-initiatives-empty']}>No links yet.</p>
      ) : (
        <ul className={styles['related-initiatives-list']}>
          {related.map((item) => (
            <li key={item.id} className={styles['related-initiatives-item']}>
              <span>• {item.projection_initiatives.name}</span>
              <button 
                onClick={() => removeLink(item.id)}
                className={styles['related-initiatives-remove']} // Use class from CSS Module
                disabled={loading}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles['related-initiatives-controls']}>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className={styles['related-initiatives-select']}
          disabled={loading}
        >
          <option value="">Select initiative</option>
          {allInitiatives.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        <button
          onClick={addLink}
          disabled={!selectedId || loading}
          className={styles['related-initiatives-add']}
        >
          {loading ? 'Processing...' : 'Add Link'}
        </button>
      </div>
    </div>
  );
};

export default RelatedInitiatives;
