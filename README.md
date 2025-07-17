# Community Hub

A comprehensive community platform that enables residents to connect, collaborate, and improve their neighborhood through idea sharing, safety alerts, item lending, and expense splitting.

## Features

### 🎯 **Ideas Hub**
- Propose ideas for community betterment
- Vote on community proposals
- Track idea status (pending, approved, implemented)
- Categories: Environment, Education, Health, Infrastructure, Safety, Technology, Social, Economic

### 🚨 **Safety Alerts**
- Report theft, robbery, and safety concerns
- Real-time incident notifications
- Location-based alerts
- Severity levels (low, medium, high, critical)
- Alert resolution tracking

### 🏪 **Community Marketplace**
- Lend and borrow items within the community
- Item categories: Electronics, Books, Tools, Furniture, Sports, etc.
- Rental pricing and duration limits
- Availability tracking and return management
- Item condition ratings

### 💰 **Expense Splitting**
- Create and manage community expenses
- Equal or custom split options
- Payment tracking and notifications
- Categories: Maintenance, Utilities, Events, Security, etc.
- Due date management and settlement tracking

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (easily replaceable with PostgreSQL/MySQL)
- **Authentication**: JWT tokens with bcrypt password hashing
- **API Documentation**: Automatic OpenAPI/Swagger documentation
- **ORM**: SQLAlchemy

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **State Management**: React Query for server state
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Styling**: Emotion (CSS-in-JS)

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python main.py
   ```

The backend will start on `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/login-json` - Login with JSON payload

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/` - List all users
- `GET /api/users/{id}` - Get user by ID

### Ideas
- `GET /api/ideas/` - List ideas (with filters)
- `POST /api/ideas/` - Create new idea
- `GET /api/ideas/{id}` - Get idea details
- `PUT /api/ideas/{id}` - Update idea
- `DELETE /api/ideas/{id}` - Delete idea
- `POST /api/ideas/{id}/vote` - Vote on idea

### Alerts
- `GET /api/alerts/` - List alerts (with filters)
- `GET /api/alerts/active` - Get active alerts only
- `POST /api/alerts/` - Create new alert
- `GET /api/alerts/{id}` - Get alert details
- `PUT /api/alerts/{id}` - Update alert
- `POST /api/alerts/{id}/resolve` - Mark alert as resolved
- `DELETE /api/alerts/{id}` - Delete alert

### Marketplace
- `GET /api/marketplace/` - List marketplace items
- `GET /api/marketplace/my-items` - Get user's items
- `GET /api/marketplace/borrowed` - Get borrowed items
- `POST /api/marketplace/` - Create new item
- `GET /api/marketplace/{id}` - Get item details
- `PUT /api/marketplace/{id}` - Update item
- `POST /api/marketplace/{id}/borrow` - Borrow item
- `POST /api/marketplace/{id}/return` - Return item
- `DELETE /api/marketplace/{id}` - Delete item

### Expenses
- `GET /api/expenses/` - List expenses
- `GET /api/expenses/my-splits` - Get user's expense splits
- `GET /api/expenses/pending-payments` - Get pending payments
- `POST /api/expenses/` - Create new expense
- `GET /api/expenses/{id}` - Get expense details
- `PUT /api/expenses/{id}` - Update expense
- `POST /api/expenses/{id}/pay` - Make payment
- `DELETE /api/expenses/{id}` - Delete expense

## Database Schema

### Core Models

- **User**: User profiles and authentication
- **Idea**: Community improvement proposals
- **Alert**: Safety and security alerts
- **MarketplaceItem**: Items for lending/borrowing
- **Expense**: Community expenses
- **ExpenseSplit**: Individual expense portions

### Key Relationships

- Users can create multiple ideas, alerts, marketplace items, and expenses
- Ideas have voting functionality
- Marketplace items track current borrower and return dates
- Expenses are split among multiple participants
- All models include timestamp tracking

## Usage Guide

### Getting Started

1. **Register/Login**: Create an account or sign in
2. **Complete Profile**: Add your contact information and address
3. **Explore Features**: Navigate through the different sections

### Ideas Hub
- Click "Share Idea" to propose improvements
- Browse and vote on existing ideas
- Filter by category or status
- Track implementation progress

### Safety Alerts
- Report incidents with "Report Alert" button
- Include location, severity, and description
- Monitor community safety status
- Resolve alerts when situations improve

### Marketplace
- Add items you want to lend with "Add Item"
- Browse available items to borrow
- Set rental prices and duration limits
- Track borrowed items and return dates

### Expense Splitting
- Create expenses with "Create Expense"
- Add participants and set split type
- Track payments and settlement status
- Monitor pending payments

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- User authorization for resource access

## Development

### Project Structure

```
community-app/
├── backend/
│   ├── app/
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── auth.py           # Authentication utilities
│   │   ├── database.py       # Database configuration
│   │   └── routers/          # API route handlers
│   ├── main.py               # FastAPI application
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   └── App.js           # Main application
│   ├── package.json         # Node dependencies
│   └── public/              # Static assets
└── README.md
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Deployment

### Backend Deployment
- Configure environment variables
- Set up production database (PostgreSQL recommended)
- Use WSGI server like Gunicorn
- Set up reverse proxy (Nginx)
- Configure SSL certificates

### Frontend Deployment
- Build production bundle: `npm run build`
- Deploy to static hosting (Netlify, Vercel, S3)
- Configure environment variables for API URL

## License

This project is open source and available under the MIT License.

## Support

For support, questions, or feature requests, please open an issue in the repository.

---

**Community Hub** - Connecting neighbors, building stronger communities! 🏘️