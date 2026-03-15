
# Parking Lot Backend

A simple Express + TypeScript backend for a parking lot system. Data is stored in-memory for now, but the structure is ready for a database layer later.

## Setup
1. Copy .env.example to .env and adjust values as needed.
2. Install dependencies: npm install
3. Run the dev server: npm run dev
4. Build and run: npm run build then npm start

## API
Base URL: http://localhost:3000

GET /health
GET /api/lot
GET /api/availability
POST /api/park
POST /api/exit
GET /api/tickets/:ticketId
GET /api/vehicles/:vehicleId

## Example
Park request body:
{ "vehicleType": "COMPACT", "plate": "ABC-123" }

Exit request body:
{ "ticketId": "<ticket-id>" }

## Tests
Run: npm test

