jest.mock('../src/models/Record');

const Record = require('../src/models/Record');
const {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
} = require('../src/controllers/recordController');

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function buildReq({ body = {}, params = {} } = {}) {
  return { body, params };
}

describe('recordController - Smoke', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('UT-SM-03: create record with valid data', async () => {
    const newRecord = { _id: '1', titulo: 'Más medallas olímpicas', isOficial: false };
    Record.create.mockResolvedValue(newRecord);
    const req = buildReq({ body: { titulo: 'Más medallas olímpicas' } });
    const res = buildRes();
    const next = jest.fn();

    await createRecord(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newRecord);
  });

  test('UT-SM-04: delete a non-official record', async () => {
    Record.findById.mockResolvedValue({ _id: '1', isOficial: false });
    Record.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    const req = buildReq({ params: { id: '1' } });
    const res = buildRes();
    const next = jest.fn();

    await deleteRecord(req, res, next);

    expect(Record.findByIdAndDelete).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('recordController - Regression', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('UT-RG-03: update record with valid partial data', async () => {
    const updated = { _id: '1', titulo: 'Nuevo título' };
    Record.findByIdAndUpdate.mockResolvedValue(updated);
    const req = buildReq({ params: { id: '1' }, body: { titulo: 'Nuevo título' } });
    const res = buildRes();
    const next = jest.fn();

    await updateRecord(req, res, next);

    expect(Record.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      { titulo: 'Nuevo título' },
      expect.objectContaining({ new: true, runValidators: true })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('UT-RG-04: getAllRecords returns sorted by createdAt desc', async () => {
    const sortMock = jest.fn().mockResolvedValue([{ _id: '1' }, { _id: '2' }]);
    Record.find.mockReturnValue({ sort: sortMock });
    const req = buildReq();
    const res = buildRes();
    const next = jest.fn();

    await getAllRecords(req, res, next);

    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('UT-RG-14: delete rejects when isOficial is true (403)', async () => {
    Record.findById.mockResolvedValue({ _id: '1', isOficial: true });
    const req = buildReq({ params: { id: '1' } });
    const res = buildRes();
    const next = jest.fn();

    await deleteRecord(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(Record.findByIdAndDelete).not.toHaveBeenCalled();
  });

  test('UT-RG-15: getRecordById returns 404 for valid-but-missing id', async () => {
    Record.findById.mockResolvedValue(null);
    const req = buildReq({ params: { id: '507f1f77bcf86cd799439011' } });
    const res = buildRes();
    const next = jest.fn();

    await getRecordById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('UT-RG-16: updateRecord returns 404 for missing id', async () => {
    Record.findByIdAndUpdate.mockResolvedValue(null);
    const req = buildReq({ params: { id: '507f1f77bcf86cd799439011' }, body: { titulo: 'x' } });
    const res = buildRes();
    const next = jest.fn();

    await updateRecord(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
