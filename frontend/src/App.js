import React, { useState, useEffect } from 'react';
import './App.css';
import LandMap from './components/LandMap';
import { getLands, buyLand, setRegion, getCurrentRegionUrl } from './services/api';
import { connectSocket } from './services/socket';

function App() {
  const [region, setRegionState] = useState('asia');
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState(null);
  const [userId, setUserId] = useState(`user-${Math.floor(Math.random() * 1000)}`);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Initial Fetch & Socket
  useEffect(() => {
    fetchLands();
    
    const socket = connectSocket(region, (update) => {
      // Update local state when event received
      setLands((prevLands) => {
         // Find if exists
         const exists = prevLands.find(l => l.land_id === update.landId);
         if (exists) {
            return prevLands.map(l => l.land_id === update.landId ? { ...l, ...update } : l);
         } else {
            return [...prevLands, { land_id: update.landId, ...update }];
         }
      });
      setMessage(`Land ${update.landId} updated!`);
    });

    return () => {
      socket.disconnect();
    };
  }, [region]);

  const fetchLands = async () => {
    setLoading(true);
    try {
      const response = await getLands();
      setLands(response.data);
    } catch (error) {
      console.error("Failed to fetch lands", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (e) => {
    const newRegion = e.target.value;
    setRegionState(newRegion);
    setRegion(newRegion); // Update API config
  };

  const handleLandSelect = (x, z, landData) => {
    // If we click an empty spot that isn't in DB, create a dummy object
    const id = `land-${x}-${z}`;
    const existing = lands.find(l => l.land_id === id);
    setSelectedLand(existing || { land_id: id, price: 100, status: 'available' });
  };

  const handleBuy = async () => {
    if (!selectedLand) return;
    
    setLoading(true);
    setMessage('');
    try {
      await buyLand({
        buyerId: userId,
        landId: selectedLand.land_id
      });
      setMessage(`Successfully bought ${selectedLand.land_id}!`);
      // Optimistic update or wait for socket? Socket is better for consistency demo.
      // But we can update local state too.
    } catch (error) {
      setMessage(`Buy failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Global Virtual Land Marketplace</h1>
        <div className="controls">
          <label>
            Region: 
            <select value={region} onChange={handleRegionChange}>
              <option value="asia">Asia (5001)</option>
              <option value="us">US (5002)</option>
              <option value="eu">EU (5003)</option>
            </select>
          </label>
          <div className="user-info">
            User ID: <strong>{userId}</strong>
          </div>
        </div>
      </header>

      <main className="App-main">
        <div className="map-container">
           <LandMap lands={lands} onSelectLand={handleLandSelect} />
        </div>
        
        <div className="sidebar">
          <h2>Selected Land</h2>
          {selectedLand ? (
            <div>
              <p>ID: {selectedLand.land_id}</p>
              <p>Status: {selectedLand.status || 'available'}</p>
              <p>Price: ${selectedLand.price || 100}</p>
              <p>Owner: {selectedLand.owner_id || 'None'}</p>
              
              {selectedLand.status !== 'owned' && (
                <button onClick={handleBuy} disabled={loading}>
                  {loading ? 'Processing...' : 'Buy Land'}
                </button>
              )}
              {selectedLand.owner_id === userId && (
                 <p>You own this!</p>
              )}
            </div>
          ) : (
            <p>Select a plot on the map.</p>
          )}

          {message && <div className="message">{message}</div>}
        </div>
      </main>
    </div>
  );
}

export default App;
