# Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Login Credentials

### Client Account
- **Email**: `client@example.com` (or any email without "editor")
- **Password**: Any password (demo mode)

### Editor Account
- **Email**: `editor@example.com` (or any email containing "editor")
- **Password**: Any password (demo mode)

## 📱 Key Features to Test

### Client Experience
1. **Login** → Use client email
2. **Dashboard** → View album statistics and recent albums
3. **My Albums** → Browse all albums with filtering
4. **View Album** → Full-screen viewer with:
   - Page navigation (arrow keys or buttons)
   - Zoom controls
   - Comment system
   - Approve/Request Revision buttons

### Editor Experience
1. **Login** → Use editor email
2. **Dashboard** → View album management dashboard
3. **Create Album** → 
   - Choose Manual or Automated
   - Fill in client details
   - Configure album options
4. **View/Edit Albums** → Manage existing albums
5. **Pending Approval** → Track albums awaiting client review

## 🎨 UI Highlights

- **Professional Design**: Modern, clean interface similar to professional editing software
- **AlbumDraft-style Viewer**: Full-screen album viewer with smooth transitions
- **Real-time Comments**: Add comments on specific pages
- **Role-based Navigation**: Different menus for clients and editors
- **Responsive Layout**: Works on desktop and tablet devices
- **Smooth Animations**: Framer Motion for page transitions

## 📁 Project Structure Overview

```
app/
├── auth/login/          # Login page
├── client/              # Client-facing pages
│   ├── dashboard/       # Client dashboard
│   ├── albums/          # Album list and viewer
│   └── profile/         # Profile settings
└── editor/              # Editor-facing pages
    ├── dashboard/       # Editor dashboard
    ├── create/          # Create new album
    ├── albums/          # Album management
    ├── pending/         # Pending approvals
    └── settings/        # Editor settings

components/
├── Album/               # Album viewer and comment components
├── Layout/              # Sidebar and header
└── Auth/                # Authentication components

store/
└── authStore.ts         # Authentication state management
```

## 🔄 Next Steps

After testing the UI, the next phase is to build the backend:

1. **Node.js/Express Server**
2. **MongoDB Database Setup**
3. **Authentication API**
4. **Album CRUD Operations**
5. **File Upload System**
6. **Zenfolio Integration**
7. **WebSocket for Real-time Updates**

## 💡 Tips

- Use browser DevTools to inspect the UI components
- Check the console for any warnings (currently using mock data)
- All routes are protected - you'll be redirected to login if not authenticated
- The sidebar shows different menus based on your role

---

**Note**: This is the frontend UI only. Backend integration will be implemented in the next phase.

