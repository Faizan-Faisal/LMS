# LMS
This is an learning management system which I made for my university 

# University LMS (Learning Management System)

A comprehensive Learning Management System built with React, FastAPI, and MySQL.

## Tech Stack
- Frontend: React.js
- Backend: FastAPI (Python)
- Database: MySQL (XAMPP)

## Project Structure
```
LMS_PROJECT/
├── frontend/           # React frontend application
├── backend/           # FastAPI backend application
└── database/          # Database schemas and migrations
```

## Setup Instructions

### Prerequisites
1. Node.js and npm
2. Python 3.8+
3. XAMPP (for MySQL)
4. Git

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### Database Setup
1. Start XAMPP and ensure MySQL service is running
2. Create a new database named 'lms_db'
3. Import the database schema from `database/schema.sql`

## Features
- User Authentication (Students, Teachers, Admin)
- Course Management
- Assignment Submission
- Grade Management
- Discussion Forums
- File Upload/Download
- Real-time Notifications

## API Documentation
Once the backend server is running, visit `http://localhost:8000/docs` for the interactive API documentation. 