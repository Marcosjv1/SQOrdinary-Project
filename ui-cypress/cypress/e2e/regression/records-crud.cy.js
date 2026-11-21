import RecordsPage from '../../pages/RecordsPage';

describe('Regression - record CRUD edge cases', () => {
  beforeEach(() => {
    cy.visitApp();
  });

  it('UI-RG-09: shows an error and keeps the form filled when record creation fails', () => {
    cy.intercept('POST', '**/api/records', {
      statusCode: 400,
      body: { message: 'Error de validación', errors: ['anio debe ser mayor o igual a 1'] },
    }).as('createRecordFail');

    cy.fixture('new-record.json').then((record) => {
      RecordsPage.fillNewRecordForm(record).submitNewRecord();
    });
    cy.wait('@createRecordFail');
    RecordsPage.newRecordError().should('be.visible');
    cy.get('[data-cy="record-titulo-input"]').should('have.value', 'Récord creado por Cypress');
  });

  it('UI-RG-11: canceling the native delete confirmation does not call the delete endpoint', () => {
    const recordId = '6650a2222222222222222222';
    cy.stubDeleteRecord(recordId);
    cy.on('window:confirm', () => false);

    RecordsPage.deleteButtonFor('Maratón más rápido en silla de ruedas').click();

    cy.get('@deleteRecord.all').should('have.length', 0);
    RecordsPage.cardByTitle('Maratón más rápido en silla de ruedas').should('exist');
  });

  it('UI-RG-12: canceling the edit modal discards changes without sending a PUT request', () => {
    cy.intercept('PUT', '**/api/records/*').as('updateRecord');

    RecordsPage.editButtonFor('Torre de cartas más alta').click();
    RecordsPage.editTituloInput().clear().type('Un título que no se debe guardar');
    RecordsPage.cancelEdit();

    RecordsPage.editModal().should('not.exist');
    RecordsPage.cardByTitle('Torre de cartas más alta').should('exist');
    cy.get('@updateRecord.all').should('have.length', 0);
  });
});
