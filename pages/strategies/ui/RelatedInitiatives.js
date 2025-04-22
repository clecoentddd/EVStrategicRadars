import React, { useEffect, useState } from 'react';
import { supabase } from "../../../utils/supabaseClient";

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
        target_initiative_id,
        projection_initiatives!target_initiative_id(id, name)
      `)
      .eq('source_initiative_id', initiativeId);

    if (error) {
      console.error('Error fetching links:', error);
    } else {
      setRelated(data.map(d => d.projection_initiatives));
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

  return (
    <div className="p-2 bg-gray-50 rounded border mt-4">
      <h4 className="font-semibold mb-2">Related Initiatives</h4>

      {related.length === 0 ? (
        <p className="text-sm text-gray-500">No links yet.</p>
      ) : (
        <ul className="mb-2">
          {related.map((item) => (
            <li key={item.id} className="text-sm text-gray-800">• {item.name}</li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
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
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          Add Link
        </button>
      </div>
    </div>
  );
};

export default RelatedInitiatives;
