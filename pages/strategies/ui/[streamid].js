import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function StrategyStream() {
  const router = useRouter();

  // Extract the UUID from the first key in the router.query object
  const streamid = Object.keys(router.query)[0];

  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!router.isReady) return; // Wait for router to be ready

    console.log("stream id is :", router.query); 

    const fetchStreamData = async () => {
      console.log("Stream ID from query:", streamid); 

      try {
        setLoading(true);
        const response = await fetch(`/api/readmodel-strategies?streamid=${streamid}`); 
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const data = await response.json();
        setStreamData(data);
      } catch (err) {
        console.error("Error fetching stream data:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamData();
  }, [router.isReady, streamid]); 

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1>Strategy Stream</h1>
      <p>Stream ID: {streamid}</p> 

      {loading && <p>Loading stream data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {streamData && (
        <div>
          <h2>Stream Details</h2>
          <pre>{JSON.stringify(streamData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}