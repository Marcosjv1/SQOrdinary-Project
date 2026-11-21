import './commands';

// Fail fast and clearly if the app throws an uncaught exception we didn't expect.
// Individual specs can override this with cy.once('uncaught:exception', ...) if needed.
Cypress.on('uncaught:exception', () => {
  return true;
});
