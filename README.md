# PicCur - Album Design System

A next-generation album design platform for photographers and editors that allows clients to review, approve, and request revisions—either via manual handcrafted designs or a semi-automated album builder.

## 🎯 Features

### For Clients
- **Secure Portal**: Login to view album drafts and provide feedback
- **Visual Review**: AlbumDraft-style viewer with flip-book interface
- **Comment System**: Add comments and feedback on specific pages
- **Approval Workflow**: Approve albums or request revisions
- **Status Tracking**: Monitor album progress and revision history

### For Editors
- **Manual Album Design**: Full creative control with custom layouts, styles, and covers
- **Automated Album Builder**: Fast-track creation with predefined templates
- **Album Management**: Create, edit, and manage multiple client albums
- **Client Communication**: Track revisions and client feedback
- **Dashboard Analytics**: View statistics and manage workflow

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **React Icons** - Icon library
- **React Hot Toast** - Notifications

### Backend (To be implemented)
- **Node.js** - Runtime environment
- **MongoDB** - Database
- **Express** - Web framework
- **JWT** - Authentication
- **Multer** - File uploads

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd piccur
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🚀 Usage

### Demo Login
- **Client**: Use any email/password (e.g., `client@example.com` / `password`)
- **Editor**: Use an email containing "editor" (e.g., `editor@example.com` / `password`)

### Client Workflow
1. Login as a client
2. View dashboard with album statistics
3. Browse albums in "My Albums"
4. Click on an album to view in full-screen viewer
5. Add comments, approve, or request revisions

### Editor Workflow
1. Login as an editor
2. Create new album (manual or automated)
3. Fill in client details and album specifications
4. View and edit albums
5. Upload albums for client review

## 📁 Project Structure

```
piccur/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── client/            # Client-facing pages
│   ├── editor/            # Editor-facing pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── Album/             # Album-related components
│   └── Layout/            # Layout components
├── store/                 # State management
└── public/                # Static assets
```

## 🎨 Key Components

- **AlbumViewer**: Full-screen album viewer with page navigation, zoom, and comments
- **CommentPanel**: Side panel for viewing and adding comments
- **Sidebar**: Navigation sidebar with role-based menu
- **Header**: Top navigation bar with search and notifications

## 🔐 Authentication

Currently using mock authentication. In production, this will be replaced with:
- JWT token-based authentication
- Role-based access control (Client, Editor, Admin)
- Secure session management

## 📝 Next Steps (Backend Implementation)

1. Set up Node.js/Express server
2. Configure MongoDB database
3. Implement authentication API
4. Create album CRUD endpoints
5. Add file upload functionality
6. Integrate Zenfolio API
7. Set up WebSocket for real-time updates
8. Implement email notifications

## 🤝 Contributing

This is a private project for PicEra. For questions or issues, please contact the development team.

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ for PicEra

