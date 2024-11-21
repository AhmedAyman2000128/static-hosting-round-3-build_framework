# Framework Build & Deploy POC

A proof of concept application that automates the process of building frameworks and deploying them to Azure Blob Storage. This project consists of a React frontend for user interactions and a Node.js backend that handles file processing and Azure integration.

![System Design](./build_framework)

## Features

- Framework build automation
- Automatic Azure container creation
- File upload to Azure Blob Storage
- Build status monitoring
- Configurable build commands
- Framework version management

## System Architecture

The application consists of two main components:

### Frontend
- React-based user interface
- File upload functionality
- Build status monitoring
- Framework configuration management

### Backend
- Node.js server
- Azure Blob Storage integration
- File processing and extraction
- Build process automation

## Prerequisites

- Node.js 16.x or higher
- Azure account with active subscription
- Azure Storage Account
- Git

## Environment Variables

### Backend (.env)
```
PORT=3000
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_ACCOUNT_NAME=your_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_account_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/framework-build-poc.git
cd static-hosting-round-3-build_framework
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

## Running the Application

### Frontend
```bash
cd frontend
npm run dev
```
Frontend will be available at `http://localhost:5173`

### Backend
```bash
cd backend
tsc
npm run build
npm start
```
Backend will be available at `http://localhost:3000`


## Azure Setup

1. Create an Azure Storage Account
2. Create connection string and access keys
3. Configure CORS settings for your storage account
4. Set up appropriate container access policies

## Build Process Flow

1. User uploads framework files through frontend
2. Backend receives files and extracts them
3. System creates a new Azure container
4. Framework is built using provided command
5. Built files are uploaded to Azure Blob Storage
6. Frontend receives container URL for access

