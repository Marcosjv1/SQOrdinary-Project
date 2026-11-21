jest.mock('bcrypt');

const bcrypt = require('bcrypt');
const User = require('../src/models/User');

describe('User model - Smoke', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('UT-SM-05: comparePassword validates correct password', async () => {
    bcrypt.compare.mockResolvedValue(true);
    const fakeUser = { password: 'hashed-value' };

    const result = await User.schema.methods.comparePassword.call(fakeUser, 'secret1');

    expect(bcrypt.compare).toHaveBeenCalledWith('secret1', 'hashed-value');
    expect(result).toBe(true);
  });
});

describe('User model - Regression', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('UT-RG-17: comparePassword returns false for wrong password', async () => {
    bcrypt.compare.mockResolvedValue(false);
    const fakeUser = { password: 'hashed-value' };

    const result = await User.schema.methods.comparePassword.call(fakeUser, 'wrongpass');

    expect(result).toBe(false);
  });
});
