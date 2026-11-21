// Page Object for the records gallery + "new record" form + edit modal.
class RecordsPage {
  // --- Gallery ---
  gallery() {
    return cy.get('[data-cy="records-gallery"]');
  }

  cards() {
    return cy.get('[data-cy="record-card"]');
  }

  cardByTitle(titulo) {
    return cy.contains('[data-cy="record-card"]', titulo);
  }

  loadingSpinner() {
    return cy.get('[data-cy="records-loading"]');
  }

  emptyMessage() {
    return cy.get('[data-cy="records-empty"]');
  }

  errorMessage() {
    return cy.get('[data-cy="records-error"]');
  }

  editButtonFor(titulo) {
    return this.cardByTitle(titulo).find('[data-cy="record-card-edit-btn"]');
  }

  deleteButtonFor(titulo) {
    return this.cardByTitle(titulo).find('[data-cy="record-card-delete-btn"]');
  }

  // --- New record form ---
  fillNewRecordForm({ titulo, descripcion, poseedor, anio, imagenUrl }) {
    cy.get('[data-cy="record-titulo-input"]').clear().type(titulo);
    cy.get('[data-cy="record-descripcion-input"]').clear().type(descripcion);
    cy.get('[data-cy="record-poseedor-input"]').clear().type(poseedor);
    cy.get('[data-cy="record-anio-input"]').clear().type(String(anio));
    cy.get('[data-cy="record-imagenUrl-input"]').clear().type(imagenUrl);
    return this;
  }

  submitNewRecord() {
    cy.get('[data-cy="record-submit-btn"]').click();
    return this;
  }

  newRecordError() {
    return cy.get('[data-cy="record-form-error"]');
  }

  // --- Edit modal ---
  editModal() {
    return cy.get('[data-cy="edit-modal"]');
  }

  editTituloInput() {
    return cy.get('[data-cy="edit-titulo-input"]');
  }

  saveEdit() {
    cy.get('[data-cy="edit-save-btn"]').click();
    return this;
  }

  cancelEdit() {
    cy.get('[data-cy="edit-cancel-btn"]').click();
    return this;
  }

  editModalError() {
    return cy.get('[data-cy="edit-modal-error"]');
  }
}

export default new RecordsPage();
