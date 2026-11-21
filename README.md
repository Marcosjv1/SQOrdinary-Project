# GuinnessWR — Software Quality Ordinary Project

**Course:** Software Quality Engineering, Period 202660
**Team:** Matias Angelico Montoto, Marcos Vidal Cerna

## SUT description

GuinnessWR is a full-stack web app to register, browse and manage extraordinary
records (think Guinness World Records). Visitors can browse a public gallery of
records; registered users can log in, create new records, edit existing ones and
delete records that are not marked official. The SUT was built in a previous
course (Programación para Internet) and is reused here as allowed by the project
guidelines.

- Frontend: React + Vite + Bootstrap 5, deployed on Netlify — https://guinnesswr.netlify.app
- Backend: Node.js + Express 5 + Mongoose, deployed on Render — https://backendguinnesswr.onrender.com
- Database: MongoDB Atlas

## How to run it

Backend:
```bash
cd backend
npm install
npm start
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Or just use the deployed URLs above — both are live.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a user account |
| POST | `/api/auth/login` | Log in, returns a JWT |
| GET | `/api/records` | List all records |
| GET | `/api/records/:id` | Get one record |
| POST | `/api/records` | Create a record |
| PUT | `/api/records/:id` | Update a record |
| DELETE | `/api/records/:id` | Delete a record (rejected if `isOficial`) |
| POST | `/api/contact` | Submit a contact message |
| GET | `/api/contact` | List contact messages |

## How to run the tests

- **Jest (unit):** `cd unit-jest && npm install && npm test` — 22 tests (5 smoke, 17 regression), ~83% statement coverage on controllers
- **Postman/Newman (API):** *pending*
- **Cypress (UI):** *pending*

## Project structure

```
GuinnessWR-ordinario/
├── unit-jest/          # Snapshot of the tested SUT modules + Jest unit tests
├── api-postman/        # Postman collection, environment, CSV data
├── ui-cypress/         # Cypress project (specs + page objects)
├── docs/               # project document, test plans, presentation
├── exploratory/        # test charters, session notes, bug reports
└── evidence/           # screenshots of passing test runs
```
