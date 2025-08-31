# Encypher Demo Website

This is a demo website built to test and showcase the [encypher](https://www.npmjs.com/package/encypher) npm package - a lightweight React hook for encrypted localStorage/sessionStorage with a useState-like API.

## About Encypher

Encypher is a React hook that provides secure encrypted storage for sensitive data in the browser using AES-GCM encryption (Web Crypto API) with an optional XOR fallback for legacy environments.

### Features
-  AES-GCM encryption (Web Crypto API)
-  Custom secret per hook or via context provider
-  Optional TTL (time-to-live) for expiring data
-  Works with localStorage, sessionStorage, or custom storage
-  Syncs across tabs/windows
-  XOR fallback for legacy browsers
-  Easy API: `[value, setValue, remove, reencrypt]`
-  Tested with React 17/18

## Demo Features

This demo website showcases:

1. **Encryption Section**: Store encrypted data with custom secrets and TTL
2. **Decryption Section**: Test decryption with correct/wrong secrets
3. **Debug Section**: View raw encrypted data and debug information
4. **Real-time Testing**: Test all functionality with immediate feedback

## Installation & Usage

```bash
# Install the encypher package
npm install encypher
# or
yarn add encypher
```

### Basic Usage

```jsx
import { useEncryptedStorage } from "encypher";

function MyComponent() {
  const [user, setUser, removeUser] = useEncryptedStorage("user", null, {
    secret: "my-strong-secret",
    storage: "local", // or "session"
    ttl: 3600 * 1000, // 1 hour (optional)
  });

  // Use like regular useState
  return (
    <div>
      <button onClick={() => setUser({ name: "John" })}>Store User</button>
      <button onClick={removeUser}>Remove User</button>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
```

## Links

- **NPM Package**: [encypher](https://www.npmjs.com/package/encypher)
- **GitHub Repository**: [sjsreehari/encypher](https://github.com/sjsreehari/encypher)
- **Author**: Sreehari S J

## Security Notes

- Always use a strong, unique secret
- The XOR fallback is insecure and should only be used for non-sensitive data
- Data is only as secure as the environment and the strength of your secret
- Not suitable for highly sensitive or regulated data

This demo website is built with React + Vite and showcases the features of the encypher package in a real-world interface.
