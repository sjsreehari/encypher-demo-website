
import React, { useState } from "react";
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
  const [decryptKey, setDecryptKey] = useState("");
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
    decryptKey || "demo-key",
    null,
    {
      secret: decryptSecret || secret,
      storage: "local",
      onError: (e) => setDecryptError(`Decryption failed: ${e?.message}`),
    }
  );

  // Function to get the actual encrypted string from localStorage
  const getEncryptedString = () => {
    try {
      const rawData = localStorage.getItem("demo-key");
      return rawData || "No encrypted data found";
    } catch (error) {
      return "Error reading from localStorage";
    }
  };

  // Function to manually decrypt data
  const handleManualDecrypt = async () => {
    if (!decryptSecret || !decryptKey) {
      setDecryptError("Please provide both secret and storage key");
      return;
    }

    try {
      setDecryptError("");
      setDecryptedResult(null);
      
      // The decryption will happen automatically when the useEncryptedStorage hook
      // tries to read the value with the provided secret
      setDecryptedResult(decryptValue);
    } catch (error) {
      setDecryptError(`Decryption failed: ${error.message}`);
      setDecryptedResult(null);
    }
  };

  // Function to export current encrypted data by storing it with a known key
  const handleExportData = async () => {
    try {
      // Store the current input with a known key that can be used for decryption
      await setValue(input);
      setDecryptKey("demo-key"); // Set the key to the same one used for encryption
      setDecryptSecret(secret); // Set the secret to the same one used for encryption
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    }
  };

  // Function to clear decrypt section
  const clearDecryptSection = () => {
    setDecryptSecret("");
    setDecryptKey("");
    setDecryptedResult(null);
    setDecryptError("");
  };

  // Function to test decryption with wrong secret
  const testWrongSecret = () => {
    setDecryptSecret("wrong-secret");
    setDecryptKey("demo-key");
  };

  // Function to test decryption with correct secret
  const testCorrectSecret = () => {
    setDecryptSecret(secret);
    setDecryptKey("demo-key");
  };

  // Function to handle decrypt data with auto-prepare
  const handleDecryptData = async () => {
    // First prepare for decryption
    await handleExportData();
    // Then perform decryption
    await handleManualDecrypt();
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">Encypher Demo</h1>
        <p className="app-subtitle">Encrypted localStorage with React</p>
      </div>
      
      <div className="sections-container">
        {/* Encryption Section */}
        <div className="card">
          <h2 className="section-title">Encryption</h2>
          
          <div className="form-group">
            <label className="form-label">Secret Key</label>
            <div className="form-row">
              <input
                type={showSecret ? "text" : "password"}
                value={secret}
                onChange={e => setSecret(e.target.value)}
                className="form-input"
                placeholder="Enter your secret key"
              />
              <button onClick={() => setShowSecret(s => !s)}>
                {showSecret ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">TTL (Time To Live)</label>
            <div className="form-row">
              <input
                type="number"
                min="0"
                value={ttl}
                onChange={e => setTtl(Number(e.target.value))}
                className="form-input-small"
                placeholder="0"
              />
              <span style={{ color: "#9ca3af" }}>seconds (0 = no expiry)</span>
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
                placeholder="Enter value to encrypt and store"
              />
              <button onClick={async () => await setValue(input)}>
                Set Value
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Re-encrypt with New Secret</label>
            <div className="form-row">
              <button onClick={remove} style={{ marginRight: "0.5rem" }}>
                Remove
              </button>
              <input
                type="text"
                placeholder="New secret key"
                value={newSecret}
                onChange={e => setNewSecret(e.target.value)}
                className="form-input-medium"
              />
              <button 
                onClick={async () => { 
                  if (newSecret) await reencrypt(newSecret); 
                }}
                disabled={!newSecret}
              >
                Re-encrypt
              </button>
            </div>
          </div>

          <div className="status-display">
            <span className="status-label">Stored Value:</span>
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
          <h2 className="section-title">Decryption</h2>
          
          <div className="form-group">
            <label className="form-label">Secret Key for Decryption</label>
            <div className="form-row">
              <input
                type={showDecryptSecret ? "text" : "password"}
                value={decryptSecret}
                onChange={e => setDecryptSecret(e.target.value)}
                className="form-input"
                placeholder="Enter secret key to decrypt"
              />
              <button onClick={() => setShowDecryptSecret(s => !s)}>
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
                placeholder="Enter storage key (e.g., demo-key)"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-row">
              <button 
                onClick={handleDecryptData}
                disabled={!decryptSecret || !decryptKey}
              >
                Decrypt Data
              </button>
              <button onClick={clearDecryptSection} style={{ marginLeft: "0.5rem" }}>
                Clear
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="form-row">
              <button onClick={testCorrectSecret} style={{ marginRight: "0.5rem" }}>
                Test Correct Secret
              </button>
              <button onClick={testWrongSecret}>
                Test Wrong Secret
              </button>
            </div>
          </div>

          {decryptError && (
            <div className="status-display error">
              <span className="status-label">Error:</span>
              <div className="status-value status-error">
                {decryptError}
              </div>
            </div>
          )}

          {decryptedResult !== null && (
            <div className="status-display">
              <span className="status-label">Decrypted Result:</span>
              <div className="status-value status-success">
                {typeof decryptedResult === 'object' 
                  ? JSON.stringify(decryptedResult, null, 2)
                  : String(decryptedResult)
                }
              </div>
            </div>
          )}

          <div className="status-display" style={{ marginTop: "1rem" }}>
            <span className="status-label">Current Decrypt Value:</span>
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
          <h2 className="section-title">Debug Information</h2>
          
          <div className="status-display">
            <span className="status-label">Raw Encrypted Data (from localStorage):</span>
            <div className="status-value" style={{ fontSize: "0.75rem", wordBreak: "break-all" }}>
              {getEncryptedString()}
            </div>
          </div>

          <div className="status-display" style={{ marginTop: "1rem" }}>
            <span className="status-label">Debug Info:</span>
            <div className="status-value" style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              <div>Encryption Secret: {secret}</div>
              <div>Decryption Secret: {decryptSecret}</div>
              <div>Storage Key: {decryptKey}</div>
              <div>Decrypted Value: {value}</div>
              <div>Decrypt Value: {decryptValue}</div>
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
