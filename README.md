# 💬 Bro-Code - Real-Time Chat Application

Live Demo: [https://bro-code-cuxb.onrender.com/](https://bro-code-cuxb.onrender.com/)

**Bro-Code** is a full-featured real-time chat application that allows users to communicate via personal and group chats.
Inspired by WhatsApp, it supports media sharing, message status indicators, typing alerts, and a clean modern UI.

---

## 🚀 Features

- 🔒 User authentication with JWT
- 💬 One-to-one & Group messaging
- 👥 Create, update, and delete groups
- 📸 Share media: Images, Videos, Files
- ✨ Real-time messaging using Socket.IO
- 🟢 Online/offline status and last seen
- ✍️ Typing indicators
- ✅ Message status: Sent, Delivered, Seen
- 🗑️ Delete messages on double-click
- 📱 Fully responsive layout (mobile, tablet, desktop)
- 🌈 Gradient UI with custom scrollbars

---

## 🛠 Tech Stack

| Tech         | Description                        |
|--------------|------------------------------------|
| **Frontend** | React.js, Context API, CSS         |
| **Backend**  | Node.js, Express.js, Socket.IO     |
| **Database** | MongoDB, Mongoose                  |
| **Media**    | Multer, Cloudinary                 |
| **Hosting**  | Render (Full-stack deployment)     |

---

## 📦 Installation & Setup

### ⚙️ Prerequisites

- Node.js
- MongoDB URI
- Cloudinary Account

---

### 🔧 Backend Setup

```bash
git clone https://github.com/the-y0gi/Bro-Code.git
cd Bro-Code/backend
npm install
```
📄 Create a .env file in backend/:
```
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Start the backend server:

```bash
npm start
```


💻 Frontend Setup
```
cd ../frontend
npm install
npm start
```
📂 Project Structure
```
Bro-Code/
│
├── backend/         # Node.js + Express + MongoDB + Socket.IO
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── utils/
│
├── frontend/        # React app with context API and CSS
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── utils/

```
🙋‍♂️ Author
Made with ❤️ by Yogesh Gadhewal
GitHub: @the-y0gi

