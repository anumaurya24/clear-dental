Clear Lakes Dental – SWE Intern Technical Assessment
Nuxt 3 + Supabase + TypeScript Full-Stack Project

This repository contains my completed submission for the Clear Lakes Dental Software Engineer Intern Online Assessment.
I selected the Nuxt + Supabase Database Demo option and implemented all required specifications, including authentication, role management, secure server APIs, and persistent data storage.

Test Login Credentials (For Reviewers)

To simplify review, the following test accounts are included:

Admin Account
Email: admin@test.com
Password: Admin123!
Role: admin

Basic User Account
Email: user@test.com
Password: User123!
Role: basic


Admins can promote/demote users and ban/unban users on the Manage Users page.

Project Summary

This project is a multi-page, full-stack Nuxt 3 application using Supabase for:

Email authentication

Role-based access control (admin and basic)

Database persistence for user entries and profiles

User management by administrators

The application implements all required functionality described in the assessment document.

Features Implemented (Matches Assessment Requirements)
Supabase Authentication

Users must sign in to access the site. Route middleware prevents unauthenticated users from viewing protected pages and redirects authenticated users away from sign-in or sign-up pages.

Role System

Basic users can submit entries and view only their own entries.

Admins can view all entries, add data, manage users, promote or demote users, and ban or unban users.

Secure Server APIs

All Supabase operations are performed in Nuxt server routes, not in the client.
Implemented routes:

/api/users (GET, PATCH)

/api/entries (GET, POST)

Required Pages

Main page (/) – displays entries (all for admin, own entries for basic).

Add Data page (/addData) – admin-only form for adding new entries.

Manage Users page (/users) – admin-only user management interface.

Ban System

If a user is marked as banned in the profiles table, they are automatically signed out and redirected to /login?error=banned.

Persistent Data

Entries and user profiles are stored in Supabase and remain available through refreshes and server restarts.

Database Schema (Supabase)
Table: profiles
Column	Type	Notes
id	uuid	Primary key
user_id	uuid	FK to auth.users.id
email	text	Email of the user
role	text	'admin' or 'basic'
banned	boolean	Default false
created_at	timestamp	Default now()
Table: entries
Column	Type	Notes
id	bigint	Primary key
user_id	uuid	FK to profiles.user_id
title	text	Entry title
details	text	Entry details
created_at	timestamp	Default now()
Page Breakdown
/ (Main Page)

Displays entries.

Admins see all entries.

Basic users see only their own entries.

Includes an entry submission form.

/addData (Add Data Page)

Admin-only.

Dedicated form for adding new entries.

/users (Manage Users Page)

Admin-only.

Allows viewing all profiles, promoting/demoting roles, and banning/unbanning users.

/login and /signup

Handles Supabase email authentication.

Middleware
auth.global.ts

Redirects unauthenticated users to /login.

Redirects authenticated users away from /login and /signup.

02-banCheck.ts

Queries profiles.banned.

If true, signs out the user and redirects them to /login?error=banned.

Installation and Running Locally
npm install
npm run dev


Application will run at:

http://localhost:3000

Testing Instructions for Reviewers
Basic User

Log in using the basic test account.

Only "Main Page" and "Logout" appear in the header.

The user can submit entries and view only their own submissions.

Admin User

Log in using the admin test account.

Header displays "Main Page", "Add Data", "Manage Users", and "Logout".

Admin can view all entries and manage all users.

Ban Test

In Supabase, set banned = true for any basic user.

Refresh the site while logged in as that user.

The user is immediately logged out and redirected.

Project Structure
├── components/
│   └── Header.vue
├── middleware/
│   ├── auth.global.ts
│   └── 02-banCheck.global.ts
├── pages/
│   ├── index.vue
│   ├── addData.vue
│   ├── users.vue
│   ├── login.vue
│   └── signup.vue
├── server/
│   └── api/
│       ├── entries.get.ts
│       ├── entries.post.ts
│       ├── users.get.ts
│       └── users.patch.ts
├── supabase/
├── public/
├── package.json
├── nuxt.config.ts
└── README.md

Deployment (Optional)

The project may be deployed using Vercel if desired:

vercel deploy

Conclusion

This project implements all required specifications for the Clear Lakes Dental SWE Intern Online Assessment using Nuxt 3, TypeScript, and Supabase.
It includes complete authentication, secure server APIs, role-based access control, user management, and persistent data.

If you would like, I can also help format this README, add screenshots, or prepare the submission email.
