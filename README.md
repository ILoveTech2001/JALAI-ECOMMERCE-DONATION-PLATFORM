# JALAI E-Commerce Donation Platform

A comprehensive donation platform that combines e-commerce functionality with orphanage management and donation tracking.

## 🚀 Project Overview

JALAI is a full-stack web application that allows users to:

- Browse and purchase products
- Make donations to orphanages
- Manage orphanage registrations and approvals
- Track donations and orders
- Admin dashboard for comprehensive management

## 🏗️ Architecture

### Backend (Spring Boot)

- **Location**: `backend/jalai-backend/`
- **Technology**: Java Spring Boot, MySQL, JWT Authentication
- **Port**: 8080
- **API Documentation**: Available at `/api` endpoints

### Frontend (React + Vite)

- **Location**: `frontend/JALAI-Ecommerce/donation-Platform/`
- **Technology**: React, Vite, Tailwind CSS, Lucide Icons
- **Port**: 3000

## 🛠️ Setup Instructions

### Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Git

### Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd backend/jalai-backend
   ```

2. **Configure Database**:

   - Create a MySQL database named `jalai_db`
   - Update `src/main/resources/application.properties` with your database credentials

3. **Run the application**:

   ```bash
   ./mvnw spring-boot:run
   ```

   The backend will be available at `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**:

   ```bash
   cd frontend/JALAI-Ecommerce/donation-Platform
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## 🔑 Default Admin Credentials

- **Email**: `admin@jalai.com`
- **Password**: `admin123`

## 📁 Project Structure

```
JALAI-JOINED-WORK/
├── backend/
│   └── jalai-backend/          # Spring Boot backend
│       ├── src/main/java/      # Java source code
│       ├── src/main/resources/ # Configuration files
│       └── pom.xml            # Maven dependencies
├── frontend/
│   └── JALAI-Ecommerce/
│       └── donation-Platform/  # React frontend
│           ├── src/           # React source code
│           ├── public/        # Static assets
│           └── package.json   # NPM dependencies
└── README.md                  # This file
```

## 🌟 Key Features

### For Users

- Product browsing and purchasing
- Orphanage discovery and donation
- User authentication and profiles
- Shopping cart and checkout
- Payment integration (Mobile Money, Orange Money)

### For Admins

- Dashboard with analytics
- Product management and approval
- Orphanage registration and approval
- Order and donation tracking
- User management
- Category management

### For Orphanages

- Registration and profile management
- Donation tracking
- Contact management

## 🔧 Development Workflow

### For Team Members

1. **Clone the repository**:

   ```bash
   git clone https://github.com/ILoveTech2001/JALAI-ECOMMERCE-DONATION-PLATFORM.git
   cd JALAI-ECOMMERCE-DONATION-PLATFORM
   ```

2. **Create a new branch for your feature**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes and commit**:

   ```bash
   git add .
   git commit -m "Add your feature description"
   ```

4. **Push your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

### Branch Naming Convention

- `feature/feature-name` - For new features
- `bugfix/bug-description` - For bug fixes
- `hotfix/urgent-fix` - For urgent fixes
- `docs/documentation-update` - For documentation updates

## 🚨 Important Notes

- Always test both frontend and backend before pushing
- Update this README when adding new features
- Follow the existing code style and conventions
- Create issues for bugs or feature requests

## 🤝 Team Collaboration

### Communication

- Use GitHub Issues for bug reports and feature requests
- Use Pull Requests for code reviews
- Comment your code for better understanding

### Code Review Process

1. Create a Pull Request
2. Request review from team members
3. Address feedback
4. Merge after approval

## 📞 Support

If you encounter any issues:

1. Check the GitHub Issues page
2. Create a new issue with detailed description
3. Contact team members for assistance

## 🎯 Current Status

✅ **Completed Features**:

- User authentication system
- Admin dashboard
- Product management
- Orphanage registration and management
- Basic donation functionality
- Responsive design

🚧 **In Progress**:

- Payment integration
- Advanced donation tracking
- Email notifications
- Image upload functionality

📋 **Planned Features**:

- Mobile app
- Advanced analytics
- Multi-language support
- Social media integration

---

**Happy Coding! 🚀**
