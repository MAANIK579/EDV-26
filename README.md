# CampusIQ - Smart Campus Management & Productivity Hub

**CampusIQ** is a modern, comprehensive, and intelligent campus management platform designed to streamline student life and administrative operations. Built with a focus on user experience, it offers a seamless interface featuring glassmorphism design, dark mode support, and interactive productivity modules.

Whether you're a student looking to track your classes, join a club, apply for placements, or an administrator managing room schedules and college-wide announcements, CampusIQ provides all the necessary tools in one unified, aesthetically pleasing hub.

## 🚀 Key Features

### 🎓 For Students
- **Smart Dashboard & Profile Tracker**: A personalized dashboard providing a quick overview of your schedule, tasks, and notifications. A dedicated profile section holds your detailed academic info, Roll No, block, and courses.
- **Productivity Suite**: Integrated Pomodoro focus timer and a priority To-Do list directly accessible within your profile.
- **Academic & Schedule Management**: View your weekly timetable, track course progress, attendance, and CGPA in real-time.
- **Room Occupancy & Smart Tracker**: Need a place to study? Check real-time availability of classrooms and study rooms to save time. 
- **Interactive Campus Map**: Navigate the campus easily and locate specific buildings, libraries, and facilities.
- **Events & RSVP**: Discover upcoming college fests, workshops, and hackathons, and RSVP with a single click.
- **Student Organizations & Clubs**: Browse campus clubs, view their activities, and apply to join your favorite technical, cultural, or sports societies.
- **Placement Cell Dashboard**: Explore upcoming placement drives, read about internship opportunities, check eligibility criteria, and apply straight from the portal.
- **Campus Hub (Services)**: Access essential services like the Central Library, cafeteria menus, live bus schedules, and the grievance redressal system.
- **AI Campus Assistant**: An integrated AI chatbot (CampusIQ Bot) trained to answer your campus-related queries instantly.
- **Customizable Experience**: A dedicated **Settings** page lets you control Appearance (Light/Dark mode transitions), Push Notifications, Email Digests, Localization (English, Hindi, Tamil, Telugu), and Privacy options.

### 🛡️ For Administrators
- **Comprehensive Admin Dashboard**: A centralized, modern control panel to manage every aspect of college life.
- **Smart Room Scheduling via PDF Parsing**: Upload weekly schedule PDFs. The system intelligently parses the document using intelligent heuristics to automatically update room occupancies block-by-block. 
- **Manual Room Override Control**: Switch individual rooms between Automatic, Available, and Occupied statuses instantly.
- **Student Directory Management**: View, filter, and manage enrolled students, ensuring data integrity.
- **Event & Announcement Broadcasting**: Create campus-wide announcements with priority levels and schedule official events flawlessly.
- **Club Approval System**: Oversee club formations, approve pending requests, and manage active campus societies.

## 🛠️ Technology Stack

**Frontend Framework & UI:**
- React.js (via Vite)
- React Router DOM for seamless Single Page Application navigation
- Custom Vanilla CSS with an emphasis on Modern UI/UX, Glassmorphism, and responsive design
- DiceBear API for dynamic user avatars
- FontAwesome for comprehensive iconography

**Backend & API:**
- Node.js & Express.js architecture
- Cross-Origin Resource Sharing (CORS) configured for secure client-server communication
- JSON Web Tokens (JWT) & bcryptjs for secure authentication and password hashing
- Multer & `pdf-parse` for smooth document uploading and intelligent text extraction

**Database:**
- PostgreSQL for a robust and scalable relational data structure
- Drizzle ORM for type-safe database interactions and schema management

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL database engine running locally or remotely (e.g., Neon.tech, Supabase)
- A package manager (npm or yarn)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/campus-iq.git
   cd campus-iq
   ```

2. **Install dependencies:**
   ```bash
   # Install root and frontend dependencies
   npm install
   
   # Install backend server dependencies
   cd server
   npm install
   cd ..
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `server` directory and configure the following:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/campus_iq
   JWT_SECRET=your_super_secret_key
   PORT=5000
   ```

4. **Initialize the Database:**
   Push the Drizzle ORM schema to your PostgreSQL database to set up the tables:
   ```bash
   cd server
   npx drizzle-kit push
   cd ..
   ```

5. **Run the Application:**
   To run both the React frontend and the Node.js backend concurrently:
   ```bash
   npm run dev
   ```
   
   Alternatively, run them separately in different terminal windows:
   ```bash
   # Terminal 1 - Frontend (Vite)
   npm run dev:client
   
   # Terminal 2 - Backend (Express)
   npm run dev:server
   ```

6. **Access the Application:**
   Open your browser and navigate to `http://localhost:5173`. You can register a new student account or log in as an administrator to explore the features.

## 📸 Screenshots

*Experience a visually stunning and dynamic interface that adapts to your preferences.*

*(Note: Add screenshot references here once visually captured)*
- `![Dashboard Overview](/docs/images/dashboard.png)`
- `![Admin Room Management](/docs/images/admin_rooms.png)`
- `![Dark Mode Settings](/docs/images/dark_mode.png)`

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page before diving in. 

## 📄 License
This project is licensed under the MIT License.

---
*Built with ❤️ to make university life smarter, more organized, and beautifully connected.*
