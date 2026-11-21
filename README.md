# Budget Tracker — Software Quality Ordinary Project

**Course:** Software Quality Engineering, Period 202660
**Team:** Matias Angelico Montoto, Marcos Vidal Cerna

## SUT description

Budget Tracker is a small web app to manage a monthly personal budget. You create
spending categories with a monthly limit, log expenses against those categories,
and see a running total of how much you have spent and how much is left, both per
category and overall for a given month.

## Tech stack

- Backend: Node.js + Express
- Frontend: plain HTML, CSS and JavaScript (no framework)
- Storage: local JSON file (`unit-jest/src/data.json`), no external database

## How to run it

```bash
cd unit-jest
npm install
npm start
```

The app runs at `http://localhost:3000`.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/categories` | Create a category |
| GET | `/api/categories` | List categories (with spent/remaining/overBudget) |
| GET | `/api/categories/:id` | Get one category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |
| POST | `/api/expenses` | Create an expense |
| GET | `/api/expenses` | List expenses (optional `?category=` and `?from=&to=`) |
| GET | `/api/expenses/:id` | Get one expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |
| GET | `/api/summary` | Overall summary (optional `?month=YYYY-MM`) |

## How to run the tests

- **Jest (unit):** `cd unit-jest && npx jest --coverage` — *pending, test plans not written yet*
- **Postman/Newman (API):** *pending*
- **Cypress (UI):** *pending*

## Project structure

```
budget-tracker/
├── unit-jest/        # SUT source code + Jest unit tests
├── api-postman/       # Postman collection, environment, CSV data
├── ui-cypress/        # Cypress project (specs + page objects)
├── docs/              # project document, test plans, presentation
├── exploratory/       # test charters, session notes, bug reports
└── evidence/          # screenshots of passing test runs
```
