 Bakery Management System

A containerized application for managing a bakery's product inventory and order processing.

---

 Architecture Overview

The system consists of the following components:

- PostgreSQL Database: Stores product information, orders, and order items.
- Redis Cache: Provides caching for product listings and order details.
- RabbitMQ: Message broker for handling order processing.
- Backend API: RESTful service built with Flask.
- Frontend: React-based web application.
- Worker Service: Processes orders from the message queue.

 System Flow

1. Customers browse products through the frontend.
2. When an order is placed, it is stored in the database and sent to RabbitMQ.
3. The worker service consumes messages from RabbitMQ and processes orders.
4. Order status is updated in the database as it progresses.

---

 Setup Instructions

 Prerequisites

- Docker and Docker Compose installed on your system.
- Git (for cloning the repository).

 Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd bakery-system
   ```
2. Start the services:
   ```
   docker-compose up -d
   ```
3. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)
   - RabbitMQ Management UI: [http://localhost:15672](http://localhost:15672) (username: `guest`, password: `guest`)

 Stopping Services

To stop all services, run:
```
   docker-compose down
```

 Rebuilding Services

If you make changes to the code, rebuild and restart the services:
```
   docker-compose build
   docker-compose up -d
```

---

 API Documentation

 Product Endpoints

 GET /api/products
Returns a list of all bakery products.

Response:
```json
[
  {
    "id": 1,
    "name": "Chocolate Cake",
    "description": "Rich chocolate layer cake with ganache",
    "price": 29.99,
    "image_url": "chocolate_cake.jpg"
  }
]
```

 Order Endpoints

 POST /api/orders
Creates a new order.

Request:
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 29.99
    }
  ]
}
```

Response:
```json
{
  "order_id": 123,
  "status": "pending",
  "queue_status": "sent to processing queue"
}
```

 GET /api/orders/{order_id}
Retrieves the status and details of an order.

Response:
```json
{
  "order_id": 123,
  "customer_name": "John Doe",
  "status": "processing",
  "created_at": "2023-04-02 15:30:45",
  "items": [
    {
      "product_name": "Chocolate Cake",
      "quantity": 2,
      "unit_price": 29.99,
      "total": 59.98
    }
  ]
}
```

 Health Check

 GET /health
Checks the health status of the backend service and its dependencies.

Response:
```json
{
  "status": "ok",
  "services": {
    "database": "healthy",
    "rabbitmq": "healthy",
    "redis": "healthy"
  }
}
```

---

 Design Decisions

 Container Structure

- Separate containers for each service to maintain isolation and scalability.
- Persistent volumes for all stateful services (PostgreSQL, Redis, RabbitMQ).
- Health checks for critical services to ensure availability.

 Advanced Features Implemented

 1. Redis Caching

- Product listings are cached to reduce database load.
- Order details are cached with a short TTL to improve performance while ensuring data freshness.
- Cache invalidation strategies implemented for data consistency.

 2. Worker Service for Order Processing

- Asynchronous order processing via RabbitMQ.
- Simulated order processing workflow with status updates.
- Error handling and retry mechanisms.

---

 Security Considerations

- Environment variables for sensitive information.
- Container isolation to limit attack surface.
- Proper network segmentation between services.

---

 Future Improvements

- Add authentication and authorization.
- Implement HTTPS with proper certificates.
- Add monitoring and alerting.
- Implement a CI/CD pipeline for automated testing and deployment.
- Enhance order processing logic.
- Implement user notifications via email or webhooks.

