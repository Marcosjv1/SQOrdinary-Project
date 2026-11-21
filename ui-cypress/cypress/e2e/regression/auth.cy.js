import AuthPage from '../../pages/AuthPage';

describe('Regression - authentication', () => {
  beforeEach(() => {
    cy.visitApp();
  });

  it('UI-RG-04: switching between login and register clears previous feedback', () => {
    cy.stubLoginInvalid();
    AuthPage.login('marcos_qa', 'wrong-password');
    cy.wait('@loginInvalid');
    AuthPage.errorMessage().should('be.visible');

    AuthPage.switchToRegister();
    AuthPage.errorMessage().should('not.exist');
  });

  it('UI-RG-05: registering with a duplicate username shows the 409 error', () => {
    cy.stubRegisterDuplicate();
    AuthPage.register('marcos_qa', 'secret123');
    cy.wait('@registerDuplicate');
    AuthPage.errorMessage().should('contain.text', 'ya existe');
  });

  it('UI-RG-06: logging in with wrong credentials shows the generic 401 error', () => {
    cy.stubLoginInvalid();
    AuthPage.login('marcos_qa', 'wrong-password');
    cy.wait('@loginInvalid');
    AuthPage.errorMessage().should('contain.text', 'Credenciales inválidas');
  });

  it('UI-RG-07: the username field rejects fewer than 3 characters (native boundary)', () => {
    AuthPage.switchToLogin();
    cy.get('[data-cy="auth-username-input"]').type('ab');
    cy.get('[data-cy="auth-password-input"]').type('secret123');
    cy.get('[data-cy="auth-username-input"]').then(($el) => {
      expect($el[0].checkValidity()).to.eq(false);
    });
  });

  it('UI-RG-08: the password field rejects fewer than 6 characters (native boundary)', () => {
    AuthPage.switchToLogin();
    cy.get('[data-cy="auth-username-input"]').type('marcos_qa');
    cy.get('[data-cy="auth-password-input"]').type('abc');
    cy.get('[data-cy="auth-password-input"]').then(($el) => {
      expect($el[0].checkValidity()).to.eq(false);
    });
  });
});
