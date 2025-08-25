# QuickGPT – AI-Powered Text & Image Generation Platform

QuickGPT is a full-stack AI SaaS platform that allows users to generate text and images using state-of-the-art AI models. The project integrates Stripe for secure payments, a credit-based system for usage, and user authentication with JWT.

🚀 Features
🔑 User Management

Secure authentication & authorization using JWT.

Protected routes to ensure only logged-in users can access credits & AI tools.

💳 Credit System & Subscription Plans

Predefined subscription plans (Basic, Pro, Premium) with varying credits.

Credits determine how many text/image generations a user can make.

Stripe Checkout integration for seamless payments.

Transaction history stored in MongoDB.

🎨 AI Generations

Text Generation: Generate AI-written content with Gemini API.

Image Generation: Generate AI-driven images via ImageKit API.

📊 Transactions & Database

Each purchase creates a transaction document in MongoDB.

Credits automatically update after successful payment.

Transactions linked to user accounts for history tracking.

🎨 UI & UX

Built with React + TailwindCSS for a clean, responsive design.

Animated loading screens for better user experience.

Automatic redirection after payment completion.

🛠️ Tech Stack

Frontend: React, TailwindCSS, React Router

Backend: Node.js, Express.js

Database: MongoDB (Mongoose ORM)

Authentication: JWT (JSON Web Tokens)

Payments: Stripe Checkout

AI Integration: Gemini API (Text), ImageKit (Image)

📌 Workflow

User signs up & logs in.

User selects a subscription plan (Basic/Pro/Premium).

Stripe Checkout processes the payment.

On success → credits are added to the user account.

User consumes credits by generating text/images.

Transactions & credits update in real-time.

📈 Future Enhancements

Role-based access (Admin Dashboard for managing plans & users).

Support for more AI models (ChatGPT, DALL·E, Stable Diffusion).

Referral & reward system.

Analytics dashboard for tracking usage.
