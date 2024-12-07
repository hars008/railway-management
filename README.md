# Railway Management System

## Overview
This is a comprehensive Railway Management System built with Node.js, Express, and PostgreSQL, providing features for train booking and management.

## Features
- User Registration and Authentication
- Role-Based Access Control (Admin and User Roles)
- Train Management
- Seat Availability Checking
- Seat Booking with Race Condition Handling
- Secure API Endpoints

## Tech Stack
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JSON Web Token (JWT) for Authentication
- Bcrypt for Password Hashing

## Prerequisites
- Node.js (v18 recommended)
- PostgreSQL
- npm or yarn

## Installation Steps

1. Clone the repository
```bash
git clone https://github.com/yourusername/railway-management-system.git
cd railway-management-system
```

2. Download and install Doker 

3. Run the following command to start the docker container
```bash
docker-compose up --build
```

4. Wait for the container to start and you should see the following message
```bash
Server is running on port 3000
```
## API Endpoints

### Authentication
- `POST /api/register` - User Registration
- `POST /api/login` - User Login

### Train Management (Admin Only)
- `POST /api/add-train` - Add New Train
  - Requires Admin API Key

### User Operations
- `GET /api/trains/availability` - Check Train Availability
- `POST /api/bookings` - Book a Seat
- `GET /api/bookings` - Get User's Booking Details

## Security Features
- JWT-based Authentication
- Admin API Key Protection
- Password Hashing
- Transaction-based Seat Booking
- Race Condition Handling

## Environment Variables
- `PORT` - Server port
- `DB_*` - Database configuration
- `JWT_SECRET` - JWT token secret
- `ADMIN_API_KEY` - Secret key for admin operations

## Error Handling
Comprehensive error handling with informative messages and appropriate HTTP status codes.

## Performance Considerations
- Pessimistic locking for seat booking
- Connection pooling
- Indexed database queries

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

