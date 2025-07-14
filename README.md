# 📚 Flip – AI-Powered Book Review & Recommendation Platform

Welcome to **Flip**, a full-stack web application that allows users to **rate, review, and discover books** with the help of a friendly AI companion named **Flipper**. Built using **React, Supabase, and the Google Books API**, Flip brings together clean design, meaningful user experience, and smart content-based filtering.

🔗 [Live Demo](https://flip-2-0-sanjanamuthukumar04s-projects.vercel.app/)
[ Feel free to make an account, rate books and leave reviews! :) ]

---

## 🚀 Features

* 🔐 **User Authentication** – Login, logout, and edit your username using Supabase Auth
* ✍️ **Review System** – Leave **1 review per book**; update it by deleting and re-posting
* ⭐️ **Half-Star Ratings** – Fine-tuned ratings for when you're unsure between 3 or 4 stars
* 📊 **Dynamic Book Pages** – View title, image, synopsis, and real-time average rating from user reviews
* 🗂️ **Top Reviewed Books** – Displays top 3 most-reviewed books, auto-updated as reviews are added
* 🔍 **Search Interface** – Search books using the Google Books API in a clean, responsive layout
* 🧠 **AI Recommendation Engine**

  * If you've reviewed at least 2 books, get **5 personalized recommendations** based on:

    * Author
    * Genre
    * Keywords
    * Theme
  * If not, enter your favorite book title and get **1 smart recommendation**
* 🧹 **Bulk Delete** – Delete all your reviews at once if you want to start fresh
* 🐬 **Flipper the AI Pal** – A lively mascot that guides users with responsive messages
* 🧾 **Review Display** – See **your own reviews and ratings** alongside those from other users, with yours always at the top

---

## 🛠 Tech Stack

* **Frontend:** React, HTML/CSS
* **Backend/DB:** Supabase (PostgreSQL + Auth + Realtime)
* **API:** Google Books API
* **AI Recommendation Logic:** TF-IDF Vectorization + Cosine Similarity (custom implementation in JavaScript)
