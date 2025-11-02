# 🏛️ BJMP Visitation Management System

A comprehensive, role-based web application designed to streamline and modernize the **Bureau of Jail Management and Penology (BJMP)** visitation process. This system provides secure inmate management, visitor processing, and facility operations through an intuitive interface built with Laravel and modern web technologies.

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🏗️ Technology Stack](#️-technology-stack)
- [🚀 Installation & Setup](#-installation--setup)
- [📁 Project Structure](#-project-structure)
- [🎯 Key Components](#-key-components)
- [🔧 Configuration](#-configuration)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License & Copyright](#-license--copyright)

---

## 🌟 Features

### 🔐 Role-Based Access Control
- **Admin**: Full system oversight, inmate/officer management, visitor analytics
- **Warden**: Facility supervision, operational oversight, strategic management
- **Assistant Warden**: Support operations, coordination assistance, quality assurance
- **Jail Head Nurse**: Medical leadership, healthcare coordination, staff supervision
- **Jail Nurse**: Patient care, medical documentation, emergency response
- **Searcher**: Gate management, visitor processing, security verification

### 👥 Inmate Management
- Digital inmate profiles with comprehensive records
- Facial recognition integration for enhanced security
- Segregated housing management (male/female facilities)
- Behavioral monitoring and classification system
- Rehabilitation progress tracking

### 🏠 Visitor Processing
- Online visitation request system
- Real-time visitor screening and background checks
- Digital visitor logs and audit trails
- Appointment scheduling and management
- Family program coordination

### 🏥 Medical Services
- Electronic health records (EHR)
- Medical appointment scheduling
- Pharmaceutical inventory management
- Emergency response coordination
- Health analytics and reporting

### 📊 Analytics & Reporting
- Real-time dashboard metrics
- Population management analytics
- Security incident reporting
- Performance evaluation systems
- Automated report generation

---

## 🏗️ Technology Stack

### Backend
- **Laravel 12.0** - PHP Framework
- **PHP 8.2+** - Server-side scripting
- **MySQL** - Database management
- **Composer** - Dependency management

### Frontend
- **Vite 7.0** - Build tool & development server
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Alpine.js 3.4** - Lightweight JavaScript framework
- **Flowbite 3.1** - UI component library
- **Animate.css 4.1** - CSS animation library
- **SweetAlert2 11.22** - Beautiful alert/modals

### Development Tools
- **Laravel Breeze** - Authentication scaffolding
- **Pest PHP** - Testing framework
- **Laravel Pint** - Code style fixer
- **Laravel Sail** - Docker development environment

---

## 🚀 Installation & Setup

### Prerequisites
- PHP 8.2 or higher
- Composer 2.0 or higher
- Node.js 18.0 or higher
- npm 9.0 or higher
- MySQL 8.0 or higher
- Git
- Xampp

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/markjordanugtongspc/bjmp-visitation-management.git
cd bjmp-visitation-management
cd main
```

#### 2. Install PHP Dependencies
```bash
composer install --optimize-autoloader --no-dev
```

#### 3. Install Node.js Dependencies
```bash
npm install
```

#### 4. Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
```

#### 5. Database Setup
```bash
php artisan migrate
php artisan db:seed
```

#### 6. Install and Configure Tailwind CSS
```bash
# Install Tailwind CSS and its dependencies
npm install -D tailwindcss postcss autoprefixer

# Or Install using this directly
npm install tailwindcss @tailwindcss/vite

# Initialize Tailwind CSS configuration
npx tailwindcss init -p

# Configure tailwind.config.js for your project
# (Configuration is already set up in this project)
```

#### 7. Install Frontend Libraries
```bash
# Install Flowbite for UI components
npm install flowbite

# Install Animate.css for animations
npm install animate.css

# Install SweetAlert2 for beautiful alerts
npm install sweetalert2

# Install Alpine.js for reactive components
npm install alpinejs
```

#### 8. Build Assets
```bash
# Development build with hot reload
npm run dev

# Production build (optimized)
npm run build
```

#### 9. Clear and Optimize
```bash
# Clear Laravel cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Or directly in instant
php artisan optimize:clear
```

#### 10. Start Development Server
```bash
# Start Laravel development server
php artisan serve

# Or use the combined development script
composer run dev
```

### Environment Variables
Configure your `.env` file with the following essential settings:

```env
APP_NAME="BJMP Visitation Management"
APP_ENV=local
APP_KEY=base64:your-generated-key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bjmp_db
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

---

## 📁 Project Structure

```
bjmp-visitation-management/
├── app/
│   ├── Http/Controllers/          # Application controllers
│   │   ├── AdminController.php
│   │   ├── WardenController.php
│   │   ├── AssistantWardenController.php
│   │   ├── SearcherController.php
│   │   ├── NurseController.php
│   │   ├── InmateController.php
│   │   ├── VisitorController.php
│   │   └── ...
│   ├── Models/                     # Eloquent models
│   ├── Helpers/                    # Custom helper functions
│   └── ...
├── resources/
│   ├── views/                      # Blade templates
│   │   ├── admin/                  # Admin-specific views
│   │   ├── warden/                 # Warden-specific views
│   │   ├── assistant-warden/       # Assistant Warden views
│   │   ├── searcher/               # Searcher views
│   │   ├── nurse/                  # Nurse views
│   │   └── ...
│   ├── js/                         # JavaScript modules
│   │   ├── dashboard/
│   │   ├── components/
│   │   ├── inmates/
│   │   ├── visitation/
│   │   └── ...
│   └── css/                        # Stylesheets
├── database/
│   ├── migrations/                 # Database migrations
│   ├── seeders/                    # Database seeders
│   └── ...
├── routes/
│   ├── web.php                     # Web routes
│   ├── api.php                     # API routes
│   └── ...
├── config/                         # Configuration files
├── public/                         # Public assets
└── storage/                        # Application storage
```

---

## 🎯 Key Components

### Role-Based Navigation System
Dynamic sidebar generation based on user roles with:
- Permission-based menu items
- Real-time route detection
- Responsive design with dark mode support
- Advanced caching for performance

### Dashboard Components
- **Informational Cards**: Contextual facts based on role and page
- **Real-time Metrics**: Live data updates and analytics
- **Interactive Charts**: Data visualization with Chart.js
- **Quick Actions**: Role-specific action buttons

### Security Features
- **Facial Recognition**: Integration with biometric systems
- **Background Checks**: Automated visitor screening
- **Audit Trails**: Comprehensive activity logging
- **Access Control**: Granular permission management

### Medical Management
- **EHR System**: Electronic health records
- **Appointment Scheduling**: Medical visit management
- **Pharmacy Integration**: Medication tracking
- **Emergency Protocols**: Crisis response systems

---

## 🔧 Configuration

### Tailwind CSS Configuration
The project uses Tailwind CSS 4.1 with custom configuration:
- Dark mode support
- Custom color palette
- Responsive breakpoints
- Component utilities

### Vite Configuration
Optimized build setup with:
- Hot module replacement (HMR)
- Asset optimization
- Source maps for development
- Production build optimization

### Laravel Configuration
- Queue system for background processing
- Event broadcasting for real-time updates
- File storage for documents and images
- Mail configuration for notifications

---

## 📚 Documentation

### API Documentation
- RESTful API endpoints
- Authentication methods
- Data models and schemas
- Error handling guidelines

### User Guides
- Role-specific user manuals
- Step-by-step process guides
- Troubleshooting common issues
- Best practices documentation

### Developer Documentation
- Code architecture overview
- Database schema documentation
- Frontend component library
- Deployment guides

---

## 🤝 Contributing

We welcome contributions to improve the BJMP Visitation Management System. Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Standards
- Follow PSR-12 coding standards
- Use Laravel Pint for code formatting
- Write tests for new features
- Update documentation as needed

---

## 🔒 Security Considerations

This application handles sensitive correctional facility data and implements:
- Data encryption at rest and in transit
- Role-based access control
- Audit logging for all actions
- Secure authentication mechanisms
- Regular security updates and patches

---

## 📄 License & Copyright

### ⚠️ IMPORTANT NOTICE

**This project is the intellectual property of the development team and is protected by copyright laws.**

- **🚫 NO CLONING OR FORKING**: Unauthorized cloning, forking, or copying of this repository is strictly prohibited without explicit written permission from the copyright holders.

- **🚫 NO REDISTRIBUTION**: Redistribution of this codebase, in whole or in part, is prohibited without express consent.

- **🚫 NO COMMERCIAL USE**: Use of this system for commercial purposes or implementation in other facilities without proper licensing is forbidden.

- **🚫 NO CLAIMING OWNERSHIP**: Claiming this work as your own, modifying the copyright notices, or removing attribution is strictly prohibited.

### 📋 Licensing Terms

- **Educational Use**: This project may be referenced for educational purposes with proper attribution.
- **Portfolio Display**: Developers involved may showcase this work in portfolios with clear credit to all contributors.
- **Research Purposes**: Academic research may reference this system with appropriate citations.

### 📧 Permission Requests

For permission to use, modify, or implement this system, please contact:
- **Email**: permissions@bjmp-visitation-management.com
- **Subject**: "BJMP System Permission Request - [Your Organization]"

### 🏛️ Institutional Notice

This system was developed as a capstone project for the Bureau of Jail Management and Penology (BJMP) and contains proprietary business logic, security implementations, and specialized workflows specific to correctional facility management.

---

### 📞 Support & Contact

For technical support, questions, or legitimate inquiries:

- **Technical Support**: support@bjmp-visitation-management.com
- **General Inquiries**: info@bjmp-visitation-management.com
- **Security Issues**: security@bjmp-visitation-management.com

---

**© 2024 BJMP Visitation Management System. All rights reserved.**

*Developed with ❤️ for the Bureau of Jail Management and Penology*
