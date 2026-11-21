jest.mock('../src/models/User');
jest.mock('jsonwebtoken');

const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const { register, login } = require('../src/controllers/authController');

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function buildReq(body) {
  return { body };
}

describe('authController - Smoke', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwt.sign.mockReturnValue('fake-token');
  });

  test('UT-SM-01: register creates user with valid data', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: '1', username: 'marcos', password: 'hashed' });
    const req = buildReq({ username: 'marcos', password: 'secret1' });
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'fake-token', username: 'marcos' })
    );
  });

  test('UT-SM-02: login succeeds with valid credentials', async () => {
    const fakeUser = { _id: '1', username: 'marcos', comparePassword: jest.fn().mockResolvedValue(true) };
    User.findOne.mockResolvedValue(fakeUser);
    const req = buildReq({ username: 'marcos', password: 'secret1' });
    const res = buildRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'fake-token', username: 'marcos' })
    );
  });
});

describe('authController - Regression', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwt.sign.mockReturnValue('fake-token');
  });

  test('UT-RG-01: register trims whitespace in username/password', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: '1', username: 'marcos', password: 'hashed' });
    const req = buildReq({ username: '  marcos  ', password: '  secret1  ' });
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'marcos' })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('UT-RG-05: generateToken payload contains userId and username', async () => {
    const fakeUser = { _id: 'abc123', username: 'marcos', comparePassword: jest.fn().mockResolvedValue(true) };
    User.findOne.mockResolvedValue(fakeUser);
    const req = buildReq({ username: 'marcos', password: 'secret1' });
    const res = buildRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'abc123', username: 'marcos' }),
      expect.any(String),
      expect.objectContaining({ expiresIn: '2h' })
    );
  });

  test('UT-RG-02: login is case-insensitive on username', async () => {
    const fakeUser = { _id: '1', username: 'marcos', comparePassword: jest.fn().mockResolvedValue(true) };
    User.findOne.mockResolvedValue(fakeUser);
    const req = buildReq({ username: 'MARCOS', password: 'secret1' });
    const res = buildRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ username: 'marcos' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('UT-RG-06: register rejects missing username', async () => {
    const req = buildReq({ password: 'secret1' });
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.create).not.toHaveBeenCalled();
  });

  test('UT-RG-07: register rejects missing password', async () => {
    const req = buildReq({ username: 'marcos' });
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.create).not.toHaveBeenCalled();
  });

  test('UT-RG-08: register rejects duplicate username (409)', async () => {
    User.findOne.mockResolvedValue({ _id: '1', username: 'marcos' });
    const req = buildReq({ username: 'marcos', password: 'secret1' });
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(User.create).not.toHaveBeenCalled();
  });

  test('UT-RG-09: login rejects wrong password (401)', async () => {
    const fakeUser = { _id: '1', username: 'marcos', comparePassword: jest.fn().mockResolvedValue(false) };
    User.findOne.mockResolvedValue(fakeUser);
    const req = buildReq({ username: 'marcos', password: 'wrongpass' });
    const res = buildRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('UT-RG-10: login rejects nonexistent username (401)', async () => {
    User.findOne.mockResolvedValue(null);
    const req = buildReq({ username: 'nadie', password: 'secret1' });
    const res = buildRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('UT-RG-11: register rejects username of 2 chars (boundary)', async () => {
    const req = buildReq({ username: 'ab', password: 'secret1' });
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('UT-RG-12: register accepts username of exactly 3 chars (boundary)', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: '1', username: 'abc', password: 'hashed' });
    const req = buildReq({ username: 'abc', password: 'secret1' });
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('UT-RG-13: register rejects password of 5 chars (boundary)', async () => {
    const req = buildReq({ username: 'marcos', password: 'abcde' });
    const res = buildRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
