# QuickGPT - Login/Signup Troubleshooting Guide

## Error: "Operation `users.findOne()` buffering timed out after 10000ms"

This error occurs when **MongoDB connection is not established** before the server tries to query the database.

---

## ✅ Solutions

### 1. **Setup Environment Variables**

Create a `.env` file in the `server/` directory with your MongoDB connection string:

```bash
# Copy the example file
cp server/.env.example server/.env
```

**Edit `server/.env`:**
```env
# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster-name.mongodb.net/

# OR Local MongoDB
MONGODB_URI=mongodb://localhost:27017/

# JWT Secret (Change this in production!)
JWT_SECRET=your_jwt_secret_key_change_this

# Other required variables
NODE_ENV=development
PORT=3000
OPENAI_API_KEY=sk-xxxxx
IMAGEKIT_PUBLIC_KEY=xxxxx
IMAGEKIT_PRIVATE_KEY=xxxxx
IMAGEKIT_URL_ENDPOINT=xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 2. **Verify MongoDB Connection**

**For MongoDB Atlas:**
- Go to https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get your connection string from "Connect" button
- Whitelist your IP address in Network Access
- Replace `<username>` and `<password>` in the connection string

**For Local MongoDB:**
- Install MongoDB: https://www.mongodb.com/try/download/community
- Start MongoDB service
- Use connection string: `mongodb://localhost:27017/`

### 3. **Install Dependencies**

```bash
cd server
npm install
```

### 4. **Start the Server**

```bash
cd server
npm run server
```

You should see:
```
✓ Database Connected
✓ MongoDB Connection String Validated
✓ Server initialization successful
Server is running on port 3000
```

---

## 🔍 Common Issues

| Issue | Solution |
|-------|----------|
| `MONGODB_URI not defined` | Create `.env` file with MongoDB connection string |
| `Invalid connection string` | Check for correct format and credentials |
| `IP not whitelisted` | Add your IP to MongoDB Atlas Network Access |
| `Database timeout` | Increase timeout values (already fixed in updated db.js) |
| `Connection refused` | Ensure MongoDB service is running (for local setup) |

---

## 📋 Testing Login/Signup

### 1. **Test Register User**
```bash
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

Expected Response:
```json
{
  "success": true,
  "token": "eyJhbGc..."
}
```

### 2. **Test Login**
```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### 3. **Check Browser Console**
- Open DevTools (F12)
- Go to Network tab
- Try login/signup
- Check if requests are successful (200 status)

---

## 🛠️ Advanced Debugging

### Check MongoDB Connection Logs
The updated `db.js` now logs:
- ✓ Database Connected
- ✗ Database Connection Error
- ✗ Database Disconnected
- Connection String validation

### Enable Debug Mode
```bash
DEBUG=mongoose:* npm run server
```

### Check if Port is in Use
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000

# Or try different port
PORT=5000 npm run server
```

---

## 📝 Files Modified

1. **`server/configs/db.js`** - Added timeout configurations and better error logging
2. **`server/server.js`** - Added proper error handling for DB connection

---

## Need More Help?

1. Check your `.env` file exists in `server/` directory
2. Verify MongoDB URI is correct
3. Check MongoDB service is running
4. Look at console logs for specific error messages
5. Ensure all dependencies are installed with `npm install`

