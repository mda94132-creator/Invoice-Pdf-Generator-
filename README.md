# SHORTWITHZAYN Invoice Generator

A responsive invoice and bookkeeping workspace for freelancers. Create invoices from a blank form, download them as PDFs, keep a local client directory, and track expenses and payments.

## Requirements

- Node.js 18.17 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. New invoices start with blank business and client fields and no line items. Add line items as needed, then save the invoice or download its PDF.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the production application |
| `npm run start` | Run the production build |
| `npm run lint` | Run the Next.js lint command |

## Features

- Invoice form with business and client details, dates, currency, tax, notes, and editable line items
- Live subtotal, tax, total, and invoice preview
- PDF invoice download using `@react-pdf/renderer`
- Save, reopen, and delete invoices
- Mark saved invoices as paid or unpaid
- Dashboard totals based on saved invoice and payment records
- Average time to pay calculated from invoice issue date to the date it is marked paid
- Client directory with search and manual client entry
- Expense tracking by date and category
- Editable profile and default invoice currency
- Responsive desktop and mobile layout

## Data and privacy

Invoices, clients, expenses, and profile settings are stored in the browser's `localStorage` on this device. There is no account system, server-side database, or cloud synchronization configured. Clearing browser storage removes those records, so download PDFs or keep other copies of important invoices.

Marking an invoice as paid updates local tracking and dashboard totals. The app does not email invoices or process payments.

## Tech stack

- Next.js App Router and TypeScript
- React Hook Form and Zod
- Tailwind CSS
- Lucide React icons
- `@react-pdf/renderer`
