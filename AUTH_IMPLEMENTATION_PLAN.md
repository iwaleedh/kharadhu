# 🔐 Authentication System Implementation Plan

## Overview

Implementing a complete authentication system for **Kharadhu** with:
- Multi-account support
- Easy account switching
- Secure local authentication
- User profile management

---

## 🏗️ Architecture

### Authentication Method

Since this is a local-first web app, we'll use:
- **Local authentication** (no backend required)
- **IndexedDB** for secure user storage
- **Password hashing** (bcrypt-js)
- **Session management** with localStorage
- **Account switching** without re-login

### Data Isolation

Each user account will have:
- Separate transaction database
- Independent categories
- Personal settings
- Isolated data (no cross-account access)

---

## 📊 Database Schema

### Users Table
```javascript
{
  id: "uuid",
  email: "user@example.com",
  name: "John Doe",
  passwordHash: "hashed_password",
  avatar: "👤", // Emoji or initials
  createdAt: "2026-01-02T12:00:00Z",
  lastLogin: "2026-01-02T15:30:00Z",
  theme: "dark",
  language: "dv", // dv or en
}
```

### Sessions Table
```javascript
{
  userId: "uuid",
  token: "session_token",
  createdAt: "2026-01-02T15:30:00Z",
  expiresAt: "2026-01-09T15:30:00Z", // 7 days
}
```

### User-Specific Tables
```javascript
// Each user has their own:
- transactions_{userId}
- categories_{userId}
- accounts_{userId}
- settings_{userId}
```

---

## 🎨 UI Components

### 1. Sign In Page
- Email input
- Password input
- "Remember me" checkbox
- Sign in button
- "Create account" link
- Bilingual (Dhivehi + English)

### 2. Sign Up Page
- Name input
- Email input
- Password input
- Confirm password
- Avatar selection (emoji picker)
- Sign up button
- "Already have account" link

### 3. Account Switcher
- Dropdown in header
- List of all accounts
- Current account highlighted
- "Add account" option
- "Sign out" option
- Quick switch (no password)

### 4. Profile Settings
- Edit name
- Change password
- Change avatar
- Theme preference
- Language preference
- Delete account

---

## 🔒 Security Features

### Password Security
```javascript
- Minimum 6 characters
- Hashed with bcrypt (10 rounds)
- Never stored in plaintext
- Secure password validation
```

### Session Management
```javascript
- 7-day expiry by default
- "Remember me" extends to 30 days
- Auto logout on expiry
- Secure token generation
```

### Data Isolation
```javascript
- Each user has separate tables
- No cross-user data access
- Account deletion removes all data
- Switching accounts changes data context
```

---

## 🎯 User Flow

### First Time User
```
1. Open app → See sign in page
2. Click "Create account"
3. Fill registration form
4. Choose avatar emoji
5. Click "Sign up"
6. Auto login → Dashboard
```

### Returning User
```
1. Open app → See sign in page
2. Email pre-filled (if remembered)
3. Enter password
4. Click "Sign in"
5. Dashboard with their data
```

### Account Switching
```
1. Click avatar in header
2. See list of accounts
3. Click another account
4. Instant switch (no password needed)
5. See that account's data
```

### Adding New Account
```
1. Click avatar → "Add account"
2. Choose: Sign in or Sign up
3. Complete authentication
4. Switch to new account
5. Both accounts available
```

---

## 📁 File Structure

```
src/
├── auth/
│   ├── authService.js         # Core auth functions
│   ├── userService.js         # User CRUD operations
│   ├── sessionService.js      # Session management
│   └── passwordUtils.js       # Password hashing
├── components/
│   ├── auth/
│   │   ├── SignInPage.jsx
│   │   ├── SignUpPage.jsx
│   │   ├── AccountSwitcher.jsx
│   │   └── ProtectedRoute.jsx
│   └── profile/
│       ├── ProfileSettings.jsx
│       └── AvatarPicker.jsx
├── contexts/
│   └── AuthContext.jsx        # Auth state management
└── hooks/
    └── useAuth.js             # Auth hook
```

---

## 🔧 Implementation Steps

### Phase 1: Core Auth System
1. ✅ Create auth database tables
2. ✅ Implement password hashing
3. ✅ Build auth service (sign in/up/out)
4. ✅ Create session management
5. ✅ Implement user service

### Phase 2: UI Components
1. ✅ Design sign in page
2. ✅ Design sign up page
3. ✅ Create auth context
4. ✅ Build protected routes
5. ✅ Add loading states

### Phase 3: Account Switching
1. ✅ Build account switcher UI
2. ✅ Implement multi-account storage
3. ✅ Add quick switch functionality
4. ✅ Update header with avatar
5. ✅ Add account management

### Phase 4: Profile & Settings
1. ✅ Create profile page
2. ✅ Add avatar picker
3. ✅ Implement password change
4. ✅ Add account deletion
5. ✅ Settings integration

---

## 🎨 Design Mockups

### Sign In Page
```
┌──────────────────────────────────────────┐
│                                          │
│          🌊 Kharadhu                     │
│            ޚަރަދު ބަރަދު ބެލެހެއްޓުން                      │
│                                          │
│    ┌──────────────────────────────┐     │
│    │  📧 Email / އީމެއިލް          │     │
│    └──────────────────────────────┘     │
│                                          │
│    ┌──────────────────────────────┐     │
│    │  🔒 Password / ޕާސްވޯޑް       │     │
│    └──────────────────────────────┘     │
│                                          │
│    ☑ Remember me / ހަނދާންކޮށްލާ       │
│                                          │
│    ┌──────────────────────────────┐     │
│    │   Sign In / ލޮގިން             │     │
│    └──────────────────────────────┘     │
│                                          │
│    Create account / އެކައުންޓް ހެދުން    │
│                                          │
└──────────────────────────────────────────┘
```

### Account Switcher
```
┌──────────────────────────────────────┐
│  👤 John Doe (Current)               │
│     john@example.com                 │
├──────────────────────────────────────┤
│  👩 Sarah Smith                       │
│     sarah@example.com                │
├──────────────────────────────────────┤
│  ➕ Add Account                       │
├──────────────────────────────────────┤
│  ⚙️ Settings                          │
│  🚪 Sign Out                          │
└──────────────────────────────────────┘
```

---

## 💾 Local Storage Strategy

### localStorage
```javascript
{
  "currentUserId": "user-123",
  "rememberedEmail": "user@example.com",
  "sessionToken": "token-abc",
  "accounts": [
    {
      "userId": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "👤",
      "lastLogin": "2026-01-02T15:30:00Z"
    },
    {
      "userId": "user-456",
      "name": "Sarah Smith",
      "email": "sarah@example.com",
      "avatar": "👩",
      "lastLogin": "2026-01-01T10:00:00Z"
    }
  ]
}
```

### IndexedDB
```javascript
// Separate database per user
Database: faaraveri_user_123
  - transactions
  - categories
  - accounts
  - settings

Database: faaraveri_user_456
  - transactions
  - categories
  - accounts
  - settings
```

---

## 🚀 Key Features

### Multi-Account Benefits
- ✅ Personal & Business separation
- ✅ Family member accounts
- ✅ Test account for trying features
- ✅ Easy switching without re-login
- ✅ All accounts accessible

### Security
- ✅ Password hashing (bcrypt)
- ✅ Session expiry
- ✅ Data isolation
- ✅ No plaintext passwords
- ✅ Secure token generation

### UX Features
- ✅ Remember me option
- ✅ Auto-fill email
- ✅ Quick account switching
- ✅ Avatar personalization
- ✅ Bilingual interface
- ✅ Dark theme throughout

---

## 🎯 Success Criteria

- ✅ Users can create accounts
- ✅ Users can sign in securely
- ✅ Multiple accounts supported
- ✅ Quick account switching works
- ✅ Data is properly isolated
- ✅ Sessions expire correctly
- ✅ UI is intuitive and beautiful
- ✅ Bilingual support maintained

---

## 📝 Notes

- **No backend required** - All auth is local
- **Privacy-first** - No data sent to servers
- **Secure** - Industry-standard password hashing
- **User-friendly** - Easy account switching
- **Scalable** - Supports unlimited accounts

---

**Ready to implement!** 🚀
