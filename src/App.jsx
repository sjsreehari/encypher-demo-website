
import React, { useState, useEffect } from "react";
import { useEncryptedStorage } from "encypher";
import "./App.css";

function App() {
  const [secret, setSecret] = useState("my-strong-secret");
  const [ttl, setTtl] = useState(0);
  const [input, setInput] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  
  // Decrypt section states
  const [decryptSecret, setDecryptSecret] = useState("");
  const [decryptKey, setDecryptKey] = useState("demo-key");
  const [decryptedResult, setDecryptedResult] = useState(null);
  const [decryptError, setDecryptError] = useState("");
  const [showDecryptSecret, setShowDecryptSecret] = useState(false);
  
  const [value, setValue, remove, reencrypt] = useEncryptedStorage(
    "demo-key",
    null,
    {
      secret,
      storage: "local",
      ttl: ttl > 0 ? ttl * 1000 : undefined,
      onError: (e) => alert("Error: " + e?.message),
      onFallback: () => alert("XOR fallback used! (not secure)"),
      onReencrypt: () => alert("Re-encrypted!"),
    }
  );

  // Create a separate storage instance for decryption testing
  const [decryptValue, decryptSetValue, decryptRemove] = useEncryptedStorage(
    decryptKey,
    null,
    {
      secret: decryptSecret,
      storage: "local",
      onError: (e) => {
        setDecryptError(`Decryption failed: ${e?.message}`);
        setDecryptedResult(null);
      },
    }
  );

  // Effect to update decrypted result when decryptValue changes
  useEffect(() => {
    if (decryptSecret && decryptKey) {
      setDecryptedResult(decryptValue);
      if (decryptValue !== null) {
        setDecryptError("");
      }
    }
  }, [decryptValue, decryptSecret, decryptKey]);

  // Function to get the actual encrypted string from localStorage
  const getEncryptedString = () => {
    try {
      const rawData = localStorage.getItem("demo-key");
      return rawData || "No encrypted data found";
    } catch (error) {
      return "Error reading from localStorage";
    }
  };

  // Function to handle store value
  const handleStoreValue = async () => {
    if (!input.trim()) {
      alert("Please enter a value to store");
      return;
    }
    try {
      await setValue(input);
      // Auto-fill decrypt section for easier testing
      setDecryptSecret(secret);
      setDecryptKey("demo-key");
    } catch (error) {
      alert(`Store failed: ${error.message}`);
    }
  };

  // Function to handle re-encrypt
  const handleReencrypt = async () => {
    if (!newSecret.trim()) {
      alert("Please enter a new secret");
      return;
    }
    try {
      await reencrypt(newSecret);
      setSecret(newSecret);
      setNewSecret("");
      // Update decrypt secret if it matches the old one
      if (decryptSecret === secret) {
        setDecryptSecret(newSecret);
      }
    } catch (error) {
      alert(`Re-encrypt failed: ${error.message}`);
    }
  };

  // Function to handle decrypt data
  const handleDecryptData = async () => {
    if (!decryptSecret || !decryptKey) {
      setDecryptError("Please provide both secret and storage key");
      return;
    }

    // Clear previous results
    setDecryptedResult(null);
    setDecryptError("");
    
    // The decryption will happen automatically via the useEncryptedStorage hook
    // and the useEffect will update the result
  };

  // Function to clear decrypt section
  const clearDecryptSection = () => {
    setDecryptSecret("");
    setDecryptKey("demo-key");
    setDecryptedResult(null);
    setDecryptError("");
  };

  // Function to test decryption with wrong secret
  const testWrongSecret = () => {
    setDecryptSecret("wrong-secret");
    setDecryptKey("demo-key");
    setDecryptedResult(null);
    setDecryptError("");
  };

  // Function to test decryption with correct secret
  const testCorrectSecret = () => {
    setDecryptSecret(secret);
    setDecryptKey("demo-key");
    setDecryptedResult(null);
    setDecryptError("");
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">Encypher Demo</h1>
        <p className="app-subtitle">Secure localStorage encryption</p>
      </div>
      
      <div className="sections-container">
        {/* Encryption Section */}
        <div className="card">
          <h2 className="section-title">Encrypt</h2>
          
          <div className="form-group">
            <label className="form-label">Secret Key</label>
            <div className="form-row">
              <input
                type={showSecret ? "text" : "password"}
                value={secret}
                onChange={e => setSecret(e.target.value)}
                className="form-input"
                placeholder="Enter secret key"
              />
              <button 
                onClick={() => setShowSecret(s => !s)}
                style={{ padding: "0.5rem", minWidth: "auto" }}
                title={showSecret ? "Hide" : "Show"}
              >
                {showSecret ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">TTL (seconds)</label>
            <div className="form-row">
              <input
                type="number"
                min="0"
                value={ttl}
                onChange={e => setTtl(Number(e.target.value))}
                className="form-input-small"
                placeholder="0"
              />
              <span style={{ color: "#666", fontSize: "0.7rem" }}>0 = no expiry</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Value to Store</label>
            <div className="form-row">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                className="form-input"
                placeholder="Enter value to encrypt"
              />
              <button onClick={handleStoreValue} disabled={!input.trim()}>
                Store
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Re-encrypt</label>
            <div className="form-row">
              <button onClick={remove} style={{ marginRight: "0.5rem" }}>
                Remove
              </button>
              <input
                type="text"
                placeholder="New secret"
                value={newSecret}
                onChange={e => setNewSecret(e.target.value)}
                className="form-input-medium"
              />
              <button 
                onClick={handleReencrypt}
                disabled={!newSecret.trim()}
              >
                Re-encrypt
              </button>
            </div>
          </div>

          <div className="status-display">
            <span className="status-label">Stored Value</span>
            <div className={`status-value ${value == null ? 'status-error' : 'status-success'}`}>
              {value == null ? (
                <em>No value stored</em>
              ) : (
                JSON.stringify(value, null, 2)
              )}
            </div>
          </div>
        </div>

        {/* Decryption Section */}
        <div className="card">
          <h2 className="section-title">Decrypt</h2>
          
          <div className="form-group">
            <label className="form-label">Secret Key</label>
            <div className="form-row">
              <input
                type={showDecryptSecret ? "text" : "password"}
                value={decryptSecret}
                onChange={e => setDecryptSecret(e.target.value)}
                className="form-input"
                placeholder="Enter secret key"
              />
              <button 
                onClick={() => setShowDecryptSecret(s => !s)}
                style={{ padding: "0.5rem", minWidth: "auto" }}
                title={showDecryptSecret ? "Hide" : "Show"}
              >
                {showDecryptSecret ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Storage Key</label>
            <div className="form-row">
              <input
                type="text"
                value={decryptKey}
                onChange={e => setDecryptKey(e.target.value)}
                className="form-input"
                placeholder="e.g., demo-key"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-row">
              <button 
                onClick={handleDecryptData}
                disabled={!decryptSecret || !decryptKey}
              >
                Decrypt
              </button>
              <button onClick={clearDecryptSection} style={{ marginLeft: "0.5rem" }}>
                Clear
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="form-row">
              <button onClick={testCorrectSecret} style={{ marginRight: "0.5rem" }}>
                Test Correct
              </button>
              <button onClick={testWrongSecret}>
                Test Wrong
              </button>
            </div>
          </div>

          {decryptError && (
            <div className="status-display error">
              <span className="status-label">Error</span>
              <div className="status-value status-error">
                {decryptError}
              </div>
            </div>
          )}

          {decryptedResult !== null && (
            <div className="status-display">
              <span className="status-label">Result</span>
              <div className="status-value status-success">
                {typeof decryptedResult === 'object' 
                  ? JSON.stringify(decryptedResult, null, 2)
                  : String(decryptedResult)
                }
              </div>
            </div>
          )}

          <div className="status-display" style={{ marginTop: "0.75rem" }}>
            <span className="status-label">Current Value</span>
            <div className={`status-value ${decryptValue == null ? 'status-error' : 'status-success'}`}>
              {decryptValue == null ? (
                <em>No value found</em>
              ) : (
                JSON.stringify(decryptValue, null, 2)
              )}
            </div>
          </div>
        </div>

        {/* Debug Info Section */}
        <div className="card">
          <h2 className="section-title">Debug</h2>
          
          <div className="status-display">
            <span className="status-label">Raw Data</span>
            <div className="status-value" style={{ fontSize: "0.6rem", wordBreak: "break-all" }}>
              {getEncryptedString()}
            </div>
          </div>

          <div className="status-display" style={{ marginTop: "0.75rem" }}>
            <span className="status-label">Info</span>
            <div className="status-value" style={{ fontSize: "0.6rem", color: "#666" }}>
              <div><strong>Enc Secret:</strong> {secret}</div>
              <div><strong>Dec Secret:</strong> {decryptSecret}</div>
              <div><strong>Storage Key:</strong> {decryptKey}</div>
              <div><strong>Value:</strong> {value}</div>
              <div><strong>Dec Value:</strong> {decryptValue}</div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <a href="https://www.npmjs.com/package/encypher" target="_blank" rel="noopener noreferrer">
          encypher
        </a> demo by Sreehari S J
      </footer>
    </div>
  );
}

export default App;
