import React, { useState, useEffect } from 'react';
import './App.css';
import LandMap from './components/LandMap';
import { getLands, buyLand, setRegion } from './services/api';
import { connectSocket } from './services/socket';

function App() {
  const [region, setRegionState] = useState('asia');
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState(null);
  const [userId] = useState(`USER_${Math.floor(1000 + Math.random() * 9000)}`);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Initial Fetch & Socket
  useEffect(() => {
    fetchLands();
    
    const socket = connectSocket(region, (update) => {
      setLands((prevLands) => {
         const exists = prevLands.find(l => l.land_id === update.landId);
         if (exists) {
            return prevLands.map(l => l.land_id === update.landId ? { ...l, ...update, land_id: update.landId } : l);
         } else {
            return [...prevLands, { land_id: update.landId, ...update }];
         }
      });
      
      // Update selected land if it was the one updated
      setSelectedLand(prev => {
        if (prev?.land_id === update.landId) {
            return { ...prev, ...update };
        }
        return prev;
      });

      showNotification(`Land ${update.landId} ownership changed!`, 'info');
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
      showNotification("Failed to fetch lands from " + region.toUpperCase(), "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleRegionChange = (e) => {
    const newRegion = e.target.value;
    setRegionState(newRegion);
    setRegion(newRegion);
    setSelectedLand(null);
  };

  const handleLandSelect = (landId, landData) => {
    const existing = lands.find(l => l.land_id === landId);
    setSelectedLand(existing || { land_id: landId, price: 100, status: 'available' });
  };

  const handleBuy = async () => {
    if (!selectedLand) return;
    
    setLoading(true);
    try {
      const res = await buyLand({
        buyerId: userId,
        landId: selectedLand.land_id
      });
      showNotification(`Successfully bought ${selectedLand.land_id}!`, 'success');
    } catch (error) {
        const errorMsg = error.response?.data?.error || error.message;
        showNotification(`Buy failed: ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo">META<span>MARKET</span></div>
        <div className="nav-controls">
          <button className="refresh-btn" onClick={fetchLands} disabled={loading}>
            {loading ? '...' : 'REFRESH'}
          </button>
          <div className="region-selector">
            <span>REGION:</span>
            <select value={region} onChange={handleRegionChange}>
              <option value="asia">ASIA-01</option>
              <option value="us">US-EAST-02</option>
              <option value="eu">EU-WEST-03</option>
            </select>
          </div>
          <div className="user-badge">
            <span className="dot"></span> {userId}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="map-wrapper">
           <LandMap lands={lands} selectedLand={selectedLand} onSelectLand={handleLandSelect} />
           
           {message.text && (
             <div className={`notification ${message.type}`}>
                {message.text}
             </div>
           )}
        </div>
        
        <aside className="details-panel">
          <div className="panel-header">
            <h3>PROPERTY DETAILS</h3>
          </div>
          
          <div className="panel-body">
            {selectedLand ? (
              <div className="land-card">
                <div className="land-id">ID: {selectedLand.land_id}</div>
                <div className="stat-row">
                  <span className="label">STATUS</span>
                  <span className={`value status-${selectedLand.status || 'available'}`}>
                    {(selectedLand.status || 'available').toUpperCase()}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="label">PRICE</span>
                  <span className="value accent">${selectedLand.price || 100}</span>
                </div>
                <div className="stat-row">
                  <span className="label">OWNER</span>
                  <span className="value owner-id">{selectedLand.owner_id || 'OPEN MARKET'}</span>
                </div>
                
                <div className="action-area">
                    {selectedLand.status !== 'owned' ? (
                        <button className="buy-btn" onClick={handleBuy} disabled={loading}>
                        {loading ? 'PROCESSING...' : 'ACQUIRE LAND'}
                        </button>
                    ) : (
                        <div className="owned-msg">
                            {selectedLand.owner_id === userId ? "YOU OWN THIS PROPERTY" : "PROPERTY UNAVAILABLE"}
                        </div>
                    )}
                </div>
              </div>
            ) : (
              <div className="empty-selection">
                <p>SELECT A PLOT TO VIEW ASSET DATA</p>
                <div className="scanner-line"></div>
              </div>
            )}
          </div>
          
          <div className="panel-footer">
            <div className="system-logs">
                <div className="log-entry">> CONNECTED TO SPANNER_GLOBAL</div>
                <div className="log-entry">> LATENCY: 24ms</div>
                <div className="log-entry">> CONSENSUS: REACHED</div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
