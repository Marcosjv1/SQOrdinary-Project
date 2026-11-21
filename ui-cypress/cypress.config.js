const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    video: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    viewportWidth: 1280,
    viewportHeight: 800,
    env: {
      apiBaseUrl: 'https://backendguinnesswr.onrender.com/api',
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
