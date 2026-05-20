import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Play, CheckCircle, Clock, AlertCircle, Database, Phone } from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ total: 0, completed: 0, logs: [] });
  const [mappings, setMappings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('sausage, mayonnaise');
  const logEndRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isProcessing) {
      interval = setInterval(async () => {
        try {
          const progRes = await axios.get(`${API_BASE}/progress`);
          setProgress(progRes.data);
          
          if (progRes.data.total > 0 && progRes.data.completed === progRes.data.total) {
            setIsProcessing(false);
            fetchMappings();
          }
        } catch (err) {
          console.error("Failed to fetch progress", err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [progress.logs]);

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/mappings`);
      setMappings(res.data);
    } catch (err) {
      console.error("Failed to fetch mappings", err);
    }
  };

  const startSourcing = async () => {
    const terms = searchTerm.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (terms.length === 0) return;

    try {
      setIsProcessing(true);
      await axios.post(`${API_BASE}/search`, { terms });
      setProgress({ total: terms.length, completed: 0, logs: ["Instacart scraping started..."] });
    } catch (err) {
      console.error("Scraping failed", err);
      setIsProcessing(false);
    }
  };

  const progressPercent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="container">
      <header>
        <h1>Supply Chain Intelligence</h1>
        <p className="subtitle">Instacart Scraper & B2B Outreach Platform</p>
      </header>

      <main>
        {/* Search Panel */}
        <div className="panel">
          <div className="upload-area">
            <Search size={48} className="upload-icon" style={{color: 'var(--accent)', marginBottom: '1rem'}} />
            <h2>Search Instacart Categories</h2>
            <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
              Enter product categories separated by commas to scrape Instacart, find manufacturers, and send outreach emails.
            </p>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', 
                maxWidth: '400px', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)', 
                background: 'rgba(0,0,0,0.2)', 
                color: 'white',
                marginBottom: '1rem',
                fontSize: '1rem'
              }}
            />
            <br />
            <button 
              className="btn" 
              onClick={startSourcing}
              disabled={isProcessing}
            >
              <Play size={18} />
              {isProcessing ? 'Scraping Instacart...' : 'Start Automated Sourcing'}
            </button>
          </div>
        </div>

        {/* Live Progress Tracker */}
        {(isProcessing || progress.total > 0) && (
          <div className="panel">
            <h3>Live Execution Pipeline</h3>
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="status-text">
              <span>{progress.completed} of {progress.total} categories processed</span>
              <span>{progressPercent}% Complete</span>
            </div>
            
            <div className="log-box">
              {progress.logs.map((log, i) => (
                <div key={i} className="log-entry">{log}</div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Database size={24} color="var(--accent)" />
            <h3>Mapped Manufacturers</h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Manufacturer</th>
                  <th>Contact Email & Phone</th>
                </tr>
              </thead>
              <tbody>
                {mappings.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No mappings yet. Start sourcing to populate this table.
                    </td>
                  </tr>
                ) : (
                  mappings.map((m) => (
                    <tr key={m.productId}>
                      <td>{m.productName}</td>
                      <td>{m.category || '-'}</td>
                      <td>
                        <span className={`badge ${m.status}`}>
                          {m.status === 'mapped' && <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />}
                          {m.status === 'pending' && <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />}
                          {m.status === 'failed' && <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />}
                          {m.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {m.manufacturerName || '-'}<br/>
                        {m.website && <a href={m.website} target="_blank" rel="noreferrer" style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Website</a>}
                      </td>
                      <td>
                        {m.email ? (
                          <div style={{ marginBottom: '4px' }}><a href={`mailto:${m.email}`} className="link">{m.email}</a></div>
                        ) : '-'}
                        {m.contact_phone && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><Phone size={10} style={{marginRight:'4px'}}/>{m.contact_phone}</div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
