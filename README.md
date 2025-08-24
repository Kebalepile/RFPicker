# TenderPick

TenderPick is a lightweight web application designed for **South African SMEs, cooperatives, and first-time bidders** to navigate the tender process with confidence.  

It combines two key features:
1. **Tender Compliance Checker** — Upload an RFQ or RFP in PDF format, and get an instant checklist, compliance score, and reminders of missing documents.
2. **Tender List Pro** — A curated, scraped feed of official tenders, enriched with summaries of required documents and compliance notes, helping users quickly filter "small fish" vs "big fish" opportunities.

---

## ✨ Features

- **Upload & Scan**: Drop RFQ/RFP PDFs and auto-generate document checklists.
- **Compliance Score**: See which SBD forms, BBBEE certificates, and Tax documents are missing.
- **Tender Listings**: Scraped from official portals, categorised by sector, value band, and province.
- **Summaries & Doc Breakdown** *(Pro feature)*: Each tender comes with a summary of returnable documents.
- **Notifications**: Reports and reminders sent via WhatsApp or SMS (no email needed).
- **Done-for-You (DFY)**: Option to have a consultant prepare your submission pack (from R3,000).
- **Responsive UI**: Mobile-first design using Vite + vanilla JS, HTML, and CSS.

---

## 🛠 Tech Stack

- **Frontend**: [Vite](https://vitejs.dev/), Vanilla JavaScript, HTML, CSS  
- **Backend** (planned): Node.js / Golang for API + scraping, Python for heavy NLP tasks  
- **Database**: MongoDB (contracts, tenders, checklists)  
- **Notifications**: WhatsApp API / Clickatell SMS  
- **Hosting**: Flexible (Netlify, Vercel, or self-host)  

---

## 🚧 Roadmap

- [x] Landing page with pricing and FAQs  
- [x] Tender compliance checklist (demo data)  
- [x] Tender list page with mock tenders + filters  
- [ ] Scraper integration for government portals  
- [ ] OTP-based login (phone number, no email)  
- [ ] WhatsApp/SMS notifications  
- [ ] Pro subscription + billing gateway (Yoco / Peach Payments)  

---

## 📦 Project Structure

```bash
tenderpick/
├── frontend/         # Vite + vanilla JS app
│   ├── index.html
│   └── src/
│       ├── modules/  # Landing, Workspace, Reports, Settings, Tenders
│       ├── styles/   # Global, Layout, Components, Responsive
│       └── utils/    # Router, State
└── backend/          # Placeholder for API + scraper (to be added)
