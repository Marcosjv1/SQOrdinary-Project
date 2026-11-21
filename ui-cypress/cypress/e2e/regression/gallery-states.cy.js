import RecordsPage from '../../pages/RecordsPage';

describe('Regression - gallery and health states', () => {
  it('UI-RG-01: shows the "backend no disponible" badge when the health check fails', () => {
    cy.stubHealthDown();
    cy.stubRecordsList();
    cy.visit('/');
    cy.wait('@health');
    cy.get('[data-cy="backend-offline-badge"]').should('be.visible');
  });

  it('UI-RG-02: shows the empty-state message when the records list is empty', () => {
    cy.visitApp('records-empty.json');
    RecordsPage.emptyMessage().should('be.visible');
    RecordsPage.cards().should('not.exist');
  });

  it('UI-RG-03: shows an error message when GET /records fails', () => {
    cy.stubHealthOk();
    cy.intercept('GET', '**/api/records', { statusCode: 500, body: {} }).as('getRecordsFail');
    cy.visit('/');
    cy.wait('@getRecordsFail');
    RecordsPage.errorMessage().should('be.visible');
  });

  it('UI-RG-10: an official record shows the "Oficial" badge and hides edit/delete actions', () => {
    cy.visitApp();
    const titulo = 'Pizza más grande del mundo';
    RecordsPage.cardByTitle(titulo).find('[data-cy="record-card-oficial-badge"]').should('be.visible');
    RecordsPage.editButtonFor(titulo).should('not.exist');
    RecordsPage.deleteButtonFor(titulo).should('not.exist');
  });
});
