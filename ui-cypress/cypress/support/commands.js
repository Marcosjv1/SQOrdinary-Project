// Custom commands for the GuinnessWR UI suite.
// All backend calls are intercepted/stubbed so the suite never depends on
// the live Render/Mongo backend being awake - see cy.intercept() usage below.

Cypress.Commands.add('stubHealthOk', () => {
  cy.intercept('GET', '**/api/health', { fixture: 'health-ok.json' }).as('health');
});

Cypress.Commands.add('stubHealthDown', () => {
  cy.intercept('GET', '**/api/health', { statusCode: 503, body: {} }).as('health');
});

Cypress.Commands.add('stubRecordsList', (fixture = 'records.json') => {
  cy.intercept('GET', '**/api/records', { fixture }).as('getRecords');
});

Cypress.Commands.add('stubCreateRecord', (fixture = 'created-record-response.json', statusCode = 201) => {
  cy.intercept('POST', '**/api/records', {
    statusCode,
    fixture: statusCode === 201 ? fixture : undefined,
  }).as('createRecord');
});

Cypress.Commands.add('stubUpdateRecord', (id, fixture = 'updated-record-response.json') => {
  cy.intercept('PUT', `**/api/records/${id}`, { fixture }).as('updateRecord');
});

Cypress.Commands.add('stubDeleteRecord', (id, statusCode = 200) => {
  cy.intercept('DELETE', `**/api/records/${id}`, {
    statusCode,
    body: { message: 'Récord eliminado correctamente' },
  }).as('deleteRecord');
});

Cypress.Commands.add('stubDeleteRecordForbidden', (id) => {
  cy.intercept('DELETE', `**/api/records/${id}`, {
    statusCode: 403,
    body: { message: 'No se puede eliminar un récord oficial' },
  }).as('deleteRecordForbidden');
});

Cypress.Commands.add('stubLoginSuccess', (fixture = 'auth-login-success.json') => {
  cy.intercept('POST', '**/api/auth/login', { statusCode: 200, fixture }).as('login');
});

Cypress.Commands.add('stubLoginInvalid', () => {
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 401,
    fixture: 'auth-login-invalid.json',
  }).as('loginInvalid');
});

Cypress.Commands.add('stubRegisterSuccess', (fixture = 'auth-register-success.json') => {
  cy.intercept('POST', '**/api/auth/register', { statusCode: 201, fixture }).as('register');
});

Cypress.Commands.add('stubRegisterDuplicate', () => {
  cy.intercept('POST', '**/api/auth/register', {
    statusCode: 409,
    body: { message: 'El nombre de usuario ya existe' },
  }).as('registerDuplicate');
});

// Visits the app after the default stubs (health ok + records list) are in place,
// and waits for the initial fetch so tests don't race the gallery render.
Cypress.Commands.add('visitApp', (recordsFixture = 'records.json') => {
  cy.stubHealthOk();
  cy.stubRecordsList(recordsFixture);
  cy.visit('/');
  cy.wait('@getRecords');
});
