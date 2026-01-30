const fs = require('fs');
const path = require('path');

// Load .env file
const envPath = path.resolve(__dirname, '../.env');
const envExamplePath = path.resolve(__dirname, '../.env.example');

let envContent = '';

// Try to read .env first, fall back to .env.example
try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Loaded environment from .env file');
} catch (err) {
  try {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
    console.log('Loaded environment from .env.example file');
  } catch (err2) {
    console.error('No .env or .env.example file found!');
    process.exit(1);
  }
}

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, value] = trimmedLine.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

// Generate env.js content
const envJsContent = `
(() => {
  // Dynamically loaded environment variables
  window.__ENV = {
    VITE_API_URL: '${envVars.VITE_API_URL}',
    VITE_SERVER_NUMBER: '${envVars.VITE_SERVER_NUMBER}',
  };
})();
`;

// Write to src/public/env.js
const outputPath = path.resolve(__dirname, '../src/public/env.js');
fs.writeFileSync(outputPath, envJsContent);

console.log('Environment variables loaded and written to src/public/env.js');
console.log('VITE_API_URL:', envVars.VITE_API_URL);
console.log('VITE_SERVER_NUMBER:', envVars.VITE_SERVER_NUMBER);