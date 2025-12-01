Timely: Event Planner Web Application

Project Description
Timely is a web application for creating, viewing, editing, and deleting events. Designed for personal, academic, or community use, it provides a simple dashboard and CRUD functionality to manage activities.
Users can add event details like name, date, location, and description.
The landing page features a team logo, site branding, and a simple "Create Event" workflow.

Part 1 focused on basic CRUD with simple design and no authentication.
Part 2 added user login, protected routes, and cloud deployment.

This project is developed by Group 59 for the INFR3120 Fall 2025 course at Ontario Tech University.

Team Members & Task Allocation

Name: Aysha Chowdhury
GitHub: AyshaChowdhury
Part 1: Repo setup, backend CRUD, README
Part 2: Authentication backend, session, protect event routes, password hashing

Name: Chidimma Onumaegbu
GitHub: Chidimmaonu
Part 1: Landing page, dashboard, UI, README
Part 2: Frontend Login/Register pages, navigation updates, flash messages, CSS

Name: Tanzib Riasad Krishty
GitHub: tanzibrk
Part 1: Cloud deployment, integration, README
Part 2: Route integration, error handling, deployment (Render), video, documentation

Technology Stack
Backend: Node.js with Express
Frontend: EJS templating, HTML, CSS, JavaScript
Database: MongoDB Atlas (Mongoose)
Authentication: Passport.js, express-session, bcryptjs
Deployment: Render (cloud web service)
Others: dotenv, connect-flash

Features
Landing page with logo and hero section
Event list dashboard with table format
Full CRUD: create, view, edit, delete events
Register and Login forms with user authentication
Responsive navigation, login/logout/link display based on session
Protected Create, Update, Delete routes (server and UI side)
Flash messages for errors and success
Cloud deployment using Render
README documentation and video submission

Project Structure
project/
config/ (app setup, passport, database)
middleware/ (authentication middleware)
models/ (Event and User schemas, Mongoose)
public/ (Assets, style.css, images, scripts)
routes/ (Main, events, auth routes)
views/
partials/ (header, nav, footer)
events/ (list, form)
auth/ (login, register)
.env (secrets/configs)
.gitignore
package.json
server.js
README.md

Setup and Installation

Clone the repository:
git clone https://github.com/chidimmaonu/INFR3120-Fall25-Project.git

Install dependencies:
cd INFR3120-Fall25-Project
npm install

Start server locally:
npm start

Visit in browser:
http://localhost:3000 (before Deployment)
https://timely-event-planner.onrender.com/ (after Deployment)

Deployment
The project is deployed on Render (https://render.com/): 
App URL: (https://timely.onrender.com)


Contributing

Each team member works on their feature branch
Frequent git pull, clear git commit messages, regular sync
All commits tracked in repo history
See .gitignore for excluded files (node_modules, .env, logs)


Demo Video
https://youtu.be/pW8rr9voxIY

Credits

Group 59 - Ontario Tech University
INFR3120, Fall 2025
Aysha Chowdhury, Chidimma Onumaegbu, Tanzib Riasad Krishty

