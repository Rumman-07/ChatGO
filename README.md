# ✦ ChatGO

> A modern, AI-powered chatbot with a clean dark interface, real-time AI interaction, Markdown support, and a secure serverless API architecture.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ChatGO-7C5CFC?style=for-the-badge)](YOUR_NETLIFY_URL)
[![Built With](https://img.shields.io/badge/Built%20With-HTML%20%7C%20CSS%20%7C%20JavaScript-111111?style=for-the-badge)](#-technology-stack)
[![Backend](https://img.shields.io/badge/Backend-Netlify%20Functions-00C7B7?style=for-the-badge)](#-architecture)

---

## 📌 Overview

**ChatGO** is a modern AI chatbot designed with a minimal, responsive, and distraction-free user interface.

The project combines a lightweight frontend with a serverless backend architecture to communicate securely with an AI model through the Groq API.

Unlike a traditional frontend-only chatbot where an API key is exposed in browser-side JavaScript, ChatGO routes API requests through a **Netlify Serverless Function**, keeping the Groq API key on the server side.

### Core Architecture

```text
User
 │
 ▼
ChatGO Frontend
 │
 │  HTTPS Request
 ▼
Netlify Serverless Function
 │
 │  Secure API Request
 │  GROQ_API_KEY
 ▼
Groq API
 │
 ▼
AI Response
 │
 ▼
ChatGO Interface
