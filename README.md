# E-commerce Backend API

A complete e-commerce backend API built with Node.js, Express, and PostgreSQL. This API provides all the necessary endpoints for managing users, products, orders, and more with JWT authentication and Docker support.

## Features

- User authentication (register, login, profile management)
- Product management (CRUD operations)
- Order management
- Shopping cart functionality
- Wishlist management
- Product reviews
- Category management
- File upload support
- Swagger API documentation
- Docker support for easy deployment

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- PostgreSQL (if running without Docker)

## Getting Started

### With Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd ecommerce-backend-pg
   ```

2. Start the application with Docker:
   ```bash
   docker-compose up --build
   ```

3. Access the API at `http://localhost:5000`
4. Access the Swagger documentation at `http://localhost:5000/api-docs`

### Without Docker

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd ecommerce-backend-pg
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables (see .env.example)

4. Create the necessary database tables (see db-init.sql)

5. Start the server:
   ```bash
   npm start
   ```

## Database Setup

After starting the application with Docker, you'll need to create the database tables. Connect to the PostgreSQL database and run the SQL commands from `db-init.sql`.

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=5000
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=ecommerce
JWT_SECRET=your_jwt_secret
```

## API Documentation

The API is documented with Swagger and can be accessed at `http://localhost:5000/api-docs` when the server is running.

## Project Structure

```
ecommerce-backend-pg/
├── controllers/        # Request handlers
├── middleware/         # Custom middleware functions
├── routes/             # API route definitions
├── uploads/            # Uploaded files
├── .env                # Environment variables
├── .gitignore          # Git ignore file
├── db.js               # Database configuration
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose configuration
├── package.json        # Node.js dependencies
├── README.md           # This file
└── server.js           # Main application file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Your Name - [Your GitHub Profile](https://github.com/yourusername)