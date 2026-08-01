# Document Management System

A lightweight web-based Document Management System for registering, managing, and searching organizational documents. The system supports **Incoming**, **Outgoing**, and **Internal** documents, along with file attachments.

---

## Features

* Register incoming, outgoing, and internal documents
* Upload an attachment for each document
* Store document information including:

  * Persian (Jalali) date
  * Title
  * Sender
  * Receiver
* Automatic document numbering
* Search documents by document number
* View complete document details
* Download uploaded attachments at any time
* Lightweight and responsive user interface

---

## Document Number Format

Each document is assigned a unique number automatically after registration.

Example:

```text
1405/I/00004
1405/O/00004
1405/N/00004
```

Where:

* `1405` → Jalali year
* `I` → Incoming document
* `O` → Outgoing document
* `N` → Internal document
* `00004` → Sequential document number

---

## Technology Stack

### Front-end

* HTML
* Vanilla JavaScript
* Pure CSS

### Back-end

* Node.js
* Express.js (REST API)

### Database

* MySQL

---

## Getting Started

### 1. Install dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

---

### 2. Import the database

Import the SQL file located in the `database` folder into your MySQL server.

---

### 3. Configure environment variables

Create a `.env` file in the project root and configure it as follows:

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

PORT=4460
```

> **It is recommended to keep the server port as `4460`.**

---

### 4. Start the server

Run:

```bash
npm start
```

Once the server starts successfully, the API will be ready and the application can be tested.

---

## Highlights

* Automatic unique document numbering
* Support for Incoming, Outgoing, and Internal documents
* File attachment upload and download
* Fast document search by document number
* RESTful API architecture
* Lightweight front-end built with Vanilla JavaScript and Pure CSS
* MySQL database
* Simple installation and setup
