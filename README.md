# Garage Maintenance Management System

A complete DBMS project for managing a garage maintenance business with customer management, service tracking, inventory management, employee management, payments, and feedback.

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Frontend**: HTML, CSS, Vanilla JavaScript (No frameworks)

## Features

### 1. Customer & Vehicle Management
- Auto-fill customer details by phone number
- Auto-fill vehicle details by vehicle number
- Create new service entries

### 2. Service Management
- Select multiple service types
- Add/remove parts from inventory
- Assign employees to services
- Track service status (Pending, In Progress, Completed)
- Auto-calculate costs

### 3. Inventory Management
- CRUD operations for parts
- Real-time stock updates
- Low stock alerts
- Prevent negative stock

### 4. Employee Management
- Add/edit/delete employees
- Track employee roles and status
- Assign employees to services

### 5. Payment Processing
- Auto-fetch service costs
- Multiple payment modes (Cash, UPI, Card, Net Banking)
- Generate printable bills
- Track payment status

### 6. Service History
- View completed services
- Filter by date, phone, vehicle number
- Immutable service snapshots

### 7. Customer Feedback
- Rating system (1-5 stars)
- Comments for completed services

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   Create a `.env` file in the root directory:
   ```
   MONGO_URI=mongodb://localhost:27017/garage_management
   PORT=5000
   NODE_ENV=development
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your system.

4. **Run the Application**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Access the Application**
   Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Project Structure

```
Grarage_Maintainance_DBMS/
├── backend/
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # REST API routes
│   ├── services/        # Transaction services
│   ├── middleware/      # Validation & error handling
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── frontend/
│   ├── pages/           # HTML pages
│   ├── css/             # Stylesheets
│   └── js/              # JavaScript files
└── package.json
```

## Database Schema

### Customer
- name, phone (unique, indexed), email, address

### Vehicle
- customerId (ref Customer), vehicleType, vehicleNumber (unique, indexed), brand, model

### Service
- customerId, vehicleId, assignedEmployees[], servicesRequested[], partsUsed[], laborCharges, totalAmount, status, serviceDate

### ServiceHistory
- Immutable snapshot of completed services

### PartsInventory
- partName, partNumber (unique), category, price, quantityAvailable

### Employee
- name, phone, role, salary, joiningDate, status

### Payment
- serviceId, partsCost, laborCost, extraCharges, totalAmount, paymentMode, paymentStatus, paymentDate

### Feedback
- serviceId, rating (1-5), comment

## API Endpoints

### Customers
- `GET /api/customers/phone/:phone` - Get customer by phone
- `POST /api/customers` - Create or update customer
- `GET /api/customers` - Get all customers
- `GET /api/customers/search?query=...` - Search customers

### Vehicles
- `GET /api/vehicles/number/:vehicleNumber` - Get vehicle by number
- `POST /api/vehicles` - Create or update vehicle
- `GET /api/vehicles/customer/:customerId` - Get vehicles by customer

### Services
- `POST /api/services` - Create service
- `GET /api/services` - Get all services (with filters)
- `GET /api/services/:id` - Get service by ID
- `PUT /api/services/:id` - Update service
- `POST /api/services/add-parts` - Add parts to service
- `POST /api/services/remove-part` - Remove part from service
- `POST /api/services/update-status` - Update service status

### Inventory
- `GET /api/parts` - Get all parts
- `GET /api/parts/:id` - Get part by ID
- `POST /api/parts` - Create part
- `PUT /api/parts/:id` - Update part
- `POST /api/parts/update-quantity` - Update stock quantity
- `DELETE /api/parts/:id` - Delete part

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `GET /api/payments/service/:serviceId` - Get payment by service
- `POST /api/payments/process` - Process payment

### Feedback
- `POST /api/feedback` - Create feedback
- `GET /api/feedback` - Get all feedback
- `GET /api/feedback/service/:serviceId` - Get feedback by service

### History
- `GET /api/history` - Get service history (with filters)

## Key Features

1. **Atomic Transactions**: Inventory updates use MongoDB transactions to ensure data consistency
2. **Auto-calculation**: Service costs are automatically calculated when parts are added/removed
3. **Real-time Updates**: Stock levels update immediately when parts are used in services
4. **Validation**: Input validation on both frontend and backend
5. **Error Handling**: Centralized error handling with meaningful messages
6. **Responsive Design**: Clean, professional UI that works on all devices

## Notes

- All inventory transactions are atomic to prevent race conditions
- Service history is immutable - completed services are snapshotted
- Payment entries are automatically created when a service is marked as completed
- The system prevents negative stock levels

## License

This project is created for academic/educational purposes.

