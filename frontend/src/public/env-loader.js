(() => {
  window.__ENV = {
    VITE_API_URL: getEnvVar('VITE_API_URL', 'http://localhost:3000'),
    VITE_SERVER_NUMBER: getEnvVar('VITE_SERVER_NUMBER', '1'),
  };

  function getEnvVar(key, defaultValue) {
    const meta = document.querySelector('meta[name="' + key + '"]');
    return meta ? meta.content : defaultValue;
  }
})();
