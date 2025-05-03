import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './StrategyStream.module.css';
import Navbar from "@/components/Navbar";
import StrategyList from './StrategyList';
import CreateStrategyForm from './CreateStrategyForm';
import CreateInitiativeForm from './CreateInitiativeForm';
import { useHandlers } from './handlers';

export default function StrategyStream() {
  const router = useRouter();
  const streamid = Object.values(router.query)[0];
  
  const [streamData, setStreamData] = useState([]);
  const [streamAggregate, setStreamAggregate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize handlers
  const handlers = useHandlers(streamid, setStreamData, setStreamAggregate, setLoading, setError);

  const fetchStreamData = async () => {
    try {
      setLoading(true);

      console.log('fetchStreamData - what stream: ', streamid);
      const aggregateResponse = await fetch(`/api/readmodel-strategies?stream_aggregate=${streamid}`);
      if (!aggregateResponse.ok) {
        throw new Error(`fetchStreamData: Failed to fetch aggregate data: ${aggregateResponse.statusText}`);
      }
      const aggregateStream = await aggregateResponse.json();

      console.log("fetchStreamData: Stream Aggregate organisation id fetched is", aggregateStream.organisationId);
      console.log("fetchStreamData: Stream Aggregate  organisation name fetched is", aggregateStream.organisationName);

      setStreamAggregate(aggregateStream || null);

      const streamResponse = await fetch(`/api/readmodel-strategies?stream_id=${streamid}`);
      console.log("fetchStreamData: Stream data response:", streamResponse);

      if (!streamResponse.ok) {
        throw new Error(`Failed to fetch stream data: ${streamResponse.statusText}`);
      }
      const streamData = await streamResponse.json();

      setStreamData(streamData.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at); 
      }));
      console.log("fetchStreamData: Stream data fetched is (streamData)", streamData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    fetchStreamData();
  }, [router.isReady, streamid]);

  const getRadarUrl = (streamAggregate) => {
    if (!streamAggregate || !streamAggregate.organisationId) {
      return '';
    }
    const organisationName = streamAggregate.organisationName;
    const organisationId = streamAggregate.organisationId;
    return `/radars/ui/${encodeURIComponent(organisationName)}?radarId=${encodeURIComponent(organisationId)}`;
  };

  return (
    <>
      <div>
        <Navbar getRadarUrl={getRadarUrl} streamAggregate={streamAggregate} />
      </div>

      <div className={styles.container}>
        <div className={styles.streamHeader}>
          <h1>
            {streamAggregate && streamAggregate.organisationName ? streamAggregate.organisationName : "Loading stream name..."}
          </h1>
          <h2>This is about strategic thinking now</h2>
        </div>
      </div>

      <div className={styles.container}>
        <button
          className={styles.createStrategyButtonStyle}
          onClick={() => handlers.setShowCreateStrategyForm(true)}
        >
          Create Strategy
        </button>

        {handlers.showCreateStrategyForm && (
          <CreateStrategyForm 
            newStrategy={handlers.newStrategy}
            handleCreateStrategyChange={handlers.handleCreateStrategyChange}
            handleCreateStrategy={handlers.handleCreateStrategy}
            handleCancelCreateStrategy={handlers.handleCancelCreateStrategy}
          />
        )}

        {handlers.showCreateElementForm && handlers.targetStrategy && (
          <CreateInitiativeForm
            targetStrategy={handlers.targetStrategy}
            newElement={handlers.newElement}
            handleCreateInitiativeChange={handlers.handleCreateInitiativeChange}
            handleCreateInitiative={handlers.handleCreateInitiative}
            handleCancelCreateInitiative={handlers.handleCancelCreateInitiative}
            editableStrategyId
            setShowCreateInitiativeForm
          />
        )}

        {loading && <p>Loading stream data...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {streamData && Array.isArray(streamData) ? (
          <StrategyList 
            strategies={streamData} 
            handlers={handlers}
            streamAggregate={streamAggregate}
          />
        ) : (
          <div style={{ color: "red" }}>No strategies defined yet.</div>
        )}
      </div>
    </>
  );
}