import { useState } from 'react';

export const useHandlers = (streamid, setStreamData, setStreamAggregate, setLoading, setError) => {
  const [editableElementId, setEditableElementId] = useState(null);
  const [tempData, setTempData] = useState(null);
  const [showCreateStrategyForm, setShowCreateStrategyForm] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    description: '',
    whatwewillnotdo: '',
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [collapsedStrategies, setCollapsedStrategies] = useState({});
  const [targetStrategy, setTargetStrategy] = useState(null);
  const [editableStrategyId, setEditableStrategyId] = useState(null);
  const [tempStrategyData, setTempStrategyData] = useState(null);
  const [expandedElementId, setExpandedElementId] = useState(null);
  const [showCreateElementForm, setShowCreateInitiativeForm] = useState(false);
  const [newElement, setNewElement] = useState({
    name: '',
    description: '',
  });

  const handleEditStrategyClick = (strategy) => {
    setEditableStrategyId(strategy.id);
    setTempStrategyData({
      name: strategy.name,
      description: strategy.description,
      whatwewillnotdo: strategy.whatwewillnotdo,
      state: strategy.state,
    });
  };

  const handleSaveStrategyClick = async (e, strategy) => {
    e.preventDefault();
    try {
      const streamId = streamid;
      console.log("handleSaveStrategyClick with streamID", streamid);
      if (!streamId) {
        throw new Error("streamId is required");
      }

      const response = await fetch(`/api/strategy-strategies?strategyId=${strategy.id}&streamId=${streamId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempStrategyData),
      });

      if (!response.ok) {
        throw new Error("Failed to update strategy");
      }

      setStreamData((prevData) =>
        prevData.map((strat) =>
          strat.id === strategy.id ? { ...strat, ...tempStrategyData } : strat
        )
      );

      alert("Strategy updated successfully!");
      setEditableStrategyId(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditInitiative = async (stream, initiative) => {
    setEditableElementId(initiative.id);
    console.log("handleEditInitiative for initiative", initiative);
    console.log("handleEditInitiative for stream", stream);
    const currentRow = initiative;
    console.log("handleEditInitiative currentRow", currentRow);
    setTempData({ ...currentRow });

    try {
      const response = await fetch(`/api/radar-items?radarId=${stream.radarId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch radar items: ${response.statusText}`);
      }

      console.log("handleEditInitiative get radar items", response.text);
      const data = await response.json();

      if (
        !Array.isArray(data) ||
        !data.every(item => item && typeof item.name === 'string' && typeof item.id === 'string')
      ) {
        throw new Error('Invalid data format received from API');
      }

      const tags = data.map(({ name, id }) => ({ name, id }));
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error fetching radar items:', error.message);
      alert('Could not fetch radar items. Please try again later.');
    }
  };

  const handleCancelClick = () => {
    setEditableElementId(null);
    setTempData(null);
  };

  const handleFieldChange = (fieldName, value) => {
    setTempData((prev) => ({
      ...prev,
      [fieldName]: fieldName === "tags"
        ? (() => {
          try {
            return JSON.parse(value);
          } catch (error) {
            console.error("Error parsing tags:", error);
            return [];
          }
        })()
        : value,
    }));
  };

  const handleElementExpand = (initiativeId) => {
    console.log("handleElementExpand - 1");
    setExpandedElementId(expandedElementId === initiativeId ? null : initiativeId);
  };

  const toggleStrategyCollapse = (strategyId) => {
    setCollapsedStrategies((prev) => ({
      ...prev,
      [strategyId]: !prev[strategyId],
    }));
  };

  const handleEditToggle = async (initiativeId) => {
    if (editableElementId === initiativeId) {
      const initiative = streamData.find((item) => item.id === initiativeId);
      if (initiative) {
        try {
          const response = await fetch(`/api/strategy-initiatives?initiativeId=${initiativeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stream_id: initiative.stream_id,
              strategy_id: initiative.strategy_id,
              diagnosis: initiative.diagnosis,
              overall_approach: initiative.overall_approach,
              set_of_coherent_actions: initiative.set_of_coherent_actions,
              proximate_objectives: initiative.proximate_objectives,
              name: initiative.name,
              description: initiative.description,
              tags: initiative.tags,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save changes');
          }

          alert('Changes saved successfully!');
        } catch (err) {
          alert(`Error: ${err.message}`);
        }
      }
      setEditableElementId(null);
    } else {
      setEditableElementId(initiativeId);
    }
  };

  const handleSaveInitiative = async (strategy, initiative) => {
    if (!editableElementId || !tempData) {
      alert("No changes to save or invalid initiative.");
      return;
    }

    try {
      const response = await fetch(`/api/strategy-initiatives?initiativeId=${editableElementId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stream_id: tempData.stream_id,
          strategy_id: tempData.strategy_id,
          diagnosis: tempData.diagnosis,
          overall_approach: tempData.overall_approach,
          set_of_coherent_actions: tempData.set_of_coherent_actions,
          proximate_objectives: tempData.proximate_objectives,
          name: tempData.name,
          description: tempData.description,
          tags: tempData.tags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      setStreamData((prevData) => {
        return prevData.map((strat) => {
          if (strat.id === strategy.id) {
            return {
              ...strat,
              elements: strat.elements.map((el) =>
                el.id === initiative.id ? { ...tempData } : el
              ),
            };
          }
          return strat;
        });
      });

      alert("Changes saved successfully!");
      setEditableElementId(null);
      setTempData(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateStrategyChange = (e) => {
    const { name, value } = e.target;
    setNewStrategy((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateInitiative = async (e) => {
    e.preventDefault();

    if (!targetStrategy) {
      console.error("No target strategy selected for creating an initiative.");
      return;
    }
    console.log('Creating initiative for strategy:', targetStrategy);
    console.log("Creating initiative with newElement", newElement);
    try {
      const response = await fetch(`/api/strategy-initiatives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stream_id: streamid,
          strategy_id: targetStrategy.id,
          name: newElement.name,
          description: newElement.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create a strategic initative');
      }

      const data = await response.json();
      alert('Strategy initiative created successfully!');
      console.log("Optimistic UI with data", data);
      console.log("Optimistic UI with prev.data", streamData);
      setShowCreateInitiativeForm(false);
      setNewElement({ name: '', description: '' });

      setStreamData((prevData) => {
        console.log("New Data to Insert:", data);
        console.log("Target Strategy ID:", targetStrategy.id);

        return prevData.map((strat) => {
          console.log("Processing Strategy:", strat);
          if (strat.id === targetStrategy.id) {
            console.log("Match Found! Updating Strategy:", strat.id);
            const updatedStrat = {
              ...strat,
              elements: [...(strat.elements || []), data.createdItem],
            };
            console.log("Updated Strategy:", updatedStrat);
            return updatedStrat;
          }
          console.log("No Match for Strategy ID:", strat.id);
          return strat;
        });
      });

      console.log("Optimistic UI with new data", streamData);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateInitiativeChange = (e) => {
    const { name, value } = e.target;
    setNewElement((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateStrategy = async (e) => {
    e.preventDefault();
    try {
        console.log("Calling POST API for", newStrategy);
        
        // 1. Create and add optimistic data FIRST
        const tempId = `temp-${Date.now()}`;
        const optimisticData = {
            id: tempId,
            created_at: new Date().toISOString(),
            name: newStrategy.name,
            description: newStrategy.description,
            whatwewillnotdo: newStrategy.whatwewillnotdo,
            stream_id: streamid,
            elements: [],
            state: "pending"
        };
        setStreamData(prev => [optimisticData, ...prev]);
        
        // 2. Make the API call
        const response = await fetch(`/api/strategy-strategies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                stream_id: streamid,
                name: newStrategy.name,
                description: newStrategy.description,
                whatwewillnotdo: newStrategy.whatwewillnotdo,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create strategy', response.statusText);
        }

        const eventData = await response.json();
        console.log('Strategy result:', eventData);
        
        // 3. Replace optimistic data with real response
        const newStrategyData = {
            created_at: eventData.result.timestamp,
            name: eventData.result.payload.name,
            description: eventData.result.payload.description,
            state: eventData.result.payload.state,
            stream_id: eventData.result.payload.stream_id,
            id: eventData.result.payload.id,
            whatwewillnotdo: eventData.result.payload.whatwewillnotdo,
            elements: [], 
        };

        setStreamData(prev => [
            newStrategyData, 
            ...prev.filter(item => item.id !== tempId)
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

        setShowCreateStrategyForm(false);
        setNewStrategy({ name: '', description: '', whatwewillnotdo: '' });

    } catch (err) {
        // 4. Remove optimistic data on error
        setStreamData(prev => prev.filter(item => item.id !== tempId));
        alert(`Error in handleCreateStrategySubmit: ${err.message}`);
    }
};

  const handleCancelCreateInitiative = () => {
    setNewElement({
      name: '',
      description: '',
    });
    setShowCreateInitiativeForm(false);
  };

  const handleCancelCreateStrategy = () => {
    setNewStrategy({
      name: '',
      description: '',
      whatwewillnotdo: '',
    });
    setShowCreateStrategyForm(false);
  };

  return {
    editableElementId,
    tempData,
    setTempData,
    showCreateStrategyForm,
    newStrategy,
    availableTags,
    collapsedStrategies,
    targetStrategy,
    editableStrategyId,
    tempStrategyData,
    expandedElementId,
    showCreateElementForm,
    newElement,
    handleEditStrategyClick,
    handleSaveStrategyClick,
    handleEditInitiative,
    handleCancelClick,
    handleFieldChange,
    handleElementExpand,
    handleEditToggle,
    handleSaveInitiative,
    handleCreateStrategyChange,
    handleCreateInitiative,
    handleCreateInitiativeChange,
    handleCreateStrategy,
    handleCancelCreateInitiative,
    handleCancelCreateStrategy,
    setShowCreateStrategyForm,
    setShowCreateInitiativeForm,
    setTargetStrategy,
    setEditableStrategyId,
    setTempStrategyData,
    setNewStrategy,
    setNewElement,
    toggleStrategyCollapse
  };
};