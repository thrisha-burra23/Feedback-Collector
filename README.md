# Feedback-Collector


# 🎯 Feedback Collector

A secure, full-stack web application for collecting, managing, and responding to user feedback. Built with Node.js, Express, MySQL, and styled using Bootstrap 5. Features role-based access (user/admin), session-based authentication, and dynamic UX powered by JavaScript's fetch API.

---

## 🚀 Features

### 🔐 Authentication
- User registration with password strength validation
- Question-based password recovery (no email required)
- Session-based login flow with protected routes
- Unique username enforcement

### 👤 User Dashboard
- Submit feedback with email/message fields
- View personal feedback entries with admin replies
- Edit or delete feedback inline (no page reload)
- Clean Bootstrap card layout with dynamic interaction

### 🛠️ Admin Dashboard
- View all user feedback
- Reply to messages
- Delete entries when needed
- Role-based access protection

---

## 🧱 Tech Stack

| Layer       | Tech Used                          |
|-------------|------------------------------------|
| Frontend    | HTML, CSS (Bootstrap), Vanilla JS |
| Backend     | Node.js with Express               |
| Database    | MySQL                              |
| Security    | bcrypt, express-session            |

---

## ⚙️ Installation & Setup

1. **Clone this repo**:
   
   git clone https://github.com/thrisha-burra23/Feedback-Collector.git
   cd Feedback-Collector
   

2. **Install dependencies**:

   npm install
   

3. **Create a .env file**:
   
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_sql_password
   DB_NAME=feedback_db
   

4. **Initialize MySQL database**:
   - Create a database called feedback_db
   - Run the SQL schema file if included (schema.sql) to set up required tables

5. **Start the app**:
   
   node app.js
  

6. Visit http://localhost:3000 to access the app

---

## 🌐 Hosting Notes

- Uses express-session for secure login persistence
- Compatible with platforms like Render, Railway, or traditional VPS
- Environment variables should be configured via dashboard or `.env` file
- `.env` is included in `.gitignore` for security

---

## 📁 File Structure


├── public/
│   └── styles.css
├── views/
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   └── admin.html
├── routes/
│   └── user.js
│   └── admin.js
├── app.js
├── .env
├── .gitignore
├── package.json


---

## 💡 Credits & Inspiration

Built by [Thrisha Burra](https://github.com/thrisha-burra23)  
Inspired by real-world feedback flows, security-first UX design, and the desire to serve niche communities with clean communication tools.

---

## 📜 License

 Feel free to use, fork, or contribute!


