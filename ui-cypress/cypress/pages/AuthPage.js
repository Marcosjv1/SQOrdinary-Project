// Page Object for the login/register card.
class AuthPage {
  switchToLogin() {
    cy.get('[data-cy="auth-mode-login"]').click();
    return this;
  }

  switchToRegister() {
    cy.get('[data-cy="auth-mode-register"]').click();
    return this;
  }

  fillCredentials(username, password) {
    cy.get('[data-cy="auth-username-input"]').clear().type(username);
    cy.get('[data-cy="auth-password-input"]').clear().type(password);
    return this;
  }

  submit() {
    cy.get('[data-cy="auth-submit-btn"]').click();
    return this;
  }

  login(username, password) {
    this.switchToLogin().fillCredentials(username, password).submit();
    return this;
  }

  register(username, password) {
    this.switchToRegister().fillCredentials(username, password).submit();
    return this;
  }

  logout() {
    cy.get('[data-cy="auth-logout-btn"]').click();
    return this;
  }

  sessionAlert() {
    return cy.get('[data-cy="auth-session-alert"]');
  }

  sessionUsername() {
    return cy.get('[data-cy="auth-session-username"]');
  }

  successMessage() {
    return cy.get('[data-cy="auth-message"]');
  }

  errorMessage() {
    return cy.get('[data-cy="auth-error"]');
  }
}

export default new AuthPage();
