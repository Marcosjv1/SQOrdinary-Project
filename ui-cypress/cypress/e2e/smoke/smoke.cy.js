import RecordsPage from '../../pages/RecordsPage';
import AuthPage from '../../pages/AuthPage';

// Smoke suite - one happy-path check per core UI feature.
// All backend calls are stubbed with cy.intercept()/fixtures (see support/commands.js),
// so these do not depend on the live Render backend being awake.

describe('UI Smoke Suite', () => {
  beforeEach(() => {
    cy.visitApp();
  });

  it('UI-SM-01: loads the app and renders the records gallery', () => {
    RecordsPage.cards().should('have.length', 3);
    RecordsPage.cardByTitle('Pizza más grande del mundo').should('be.visible');
  });

  it('UI-SM-02: logs in successfully with valid credentials', () => {
    cy.stubLoginSuccess();
    AuthPage.login('marcos_qa', 'secret123');
    cy.wait('@login');
    AuthPage.sessionAlert().should('be.visible');
    AuthPage.sessionUsername().should('contain.text', 'marcos_qa');
  });

  it('UI-SM-03: creates a new record through the form', () => {
    cy.stubCreateRecord();
    cy.fixture('new-record.json').then((record) => {
      RecordsPage.fillNewRecordForm(record).submitNewRecord();
    });
    cy.wait('@createRecord');
    cy.wait('@getRecords');
  });

  it('UI-SM-04: edits an existing record through the modal', () => {
    cy.stubUpdateRecord('6650a2222222222222222222');
    RecordsPage.editButtonFor('Maratón más rápido en silla de ruedas').click();
    RecordsPage.editModal().should('be.visible');
    RecordsPage.editTituloInput().clear().type('Maratón más rápido en silla de ruedas (editado)');
    RecordsPage.saveEdit();
    cy.wait('@updateRecord');
    RecordsPage.editModal().should('not.exist');
  });
});
