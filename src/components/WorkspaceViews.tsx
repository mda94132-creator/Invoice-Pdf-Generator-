"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CircleHelp, FileText, Mail, Plus, Search, Trash2, Users, Wallet } from "lucide-react";
import type { InvoiceData } from "@/components/InvoicePdf";

export type SavedInvoice = InvoiceData & { id: string; createdAt: string; total: number; status?: "unpaid" | "paid"; paidAt?: string };
export type Client = { id: string; name: string; email: string; address: string };
export type Expense = { id: string; description: string; category: string; date: string; amount: number };
export type Profile = { name: string; email: string; businessName: string; currency: string };
const money = (value: number, currency: string) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);

export function WorkspaceView({ view, invoices, clients, expenses, profile, currency, onAddClient, onDeleteClient, onAddExpense, onDeleteExpense, onSaveProfile, onNewInvoice, onOpenInvoice, onTogglePaid, onToast }: {
  view: string; invoices: SavedInvoice[]; clients: Client[]; expenses: Expense[]; profile: Profile; currency: string;
  onAddClient: (client: Omit<Client, "id">) => void; onDeleteClient: (id: string) => void;
  onAddExpense: (expense: Omit<Expense, "id">) => void; onDeleteExpense: (id: string) => void;
  onSaveProfile: (profile: Profile) => void; onNewInvoice: () => void; onOpenInvoice: (invoice: SavedInvoice) => void; onTogglePaid: (invoice: SavedInvoice) => void; onToast: (message: string) => void;
}) {
  const title = view === "overview" ? "Overview" : view === "clients" ? "Clients" : view === "expenses" ? "Expenses" : view === "settings" ? "Settings" : "Help & support";
  const subtitle = view === "overview" ? "A clear picture of how your freelance business is doing." : view === "clients" ? "Keep your client details organized in one place." : view === "expenses" ? "Track business spending alongside your invoices." : view === "settings" ? "Manage your profile and invoice defaults." : "Quick answers and ways to get help.";
  return <>
    <div className="heading-row"><div><h1>{title}</h1><p className="subtitle">{subtitle}</p></div>{view === "overview" && <button className="button primary" onClick={onNewInvoice}><Plus size={16}/> New invoice</button>}</div>
    {view === "overview" && <Overview invoices={invoices} clients={clients} expenses={expenses} currency={currency} onNewInvoice={onNewInvoice} onOpenInvoice={onOpenInvoice} onTogglePaid={onTogglePaid}/>}
    {view === "clients" && <Clients clients={clients} onAdd={onAddClient} onDelete={onDeleteClient} onToast={onToast}/>}
    {view === "expenses" && <Expenses expenses={expenses} currency={currency} onAdd={onAddExpense} onDelete={onDeleteExpense}/>}
    {view === "settings" && <Settings profile={profile} onSave={onSaveProfile} onToast={onToast}/>}
    {view === "help" && <Help onToast={onToast}/>}
  </>;
}

function Overview({ invoices, clients, expenses, currency, onNewInvoice, onOpenInvoice, onTogglePaid }: { invoices: SavedInvoice[]; clients: Client[]; expenses: Expense[]; currency: string; onNewInvoice: () => void; onOpenInvoice: (invoice: SavedInvoice) => void; onTogglePaid: (invoice: SavedInvoice) => void }) {
  const revenue = invoices.filter(invoice => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.total, 0);
  const spend = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return <>
    <section className="stats">
      <Stat label="Saved invoice revenue" value={money(revenue, currency)} icon={<ArrowDownLeft size={15}/>} foot={`${invoices.length} saved invoice${invoices.length === 1 ? "" : "s"}`}/>
      <Stat label="Tracked expenses" value={money(spend, currency)} icon={<Wallet size={15}/>} foot={`${expenses.length} expense${expenses.length === 1 ? "" : "s"} recorded`}/>
      <Stat label="Your clients" value={String(clients.length)} icon={<Users size={15}/>} foot="Saved on this device"/>
      <Stat label="Invoices created" value={String(invoices.length)} icon={<FileText size={15}/>} foot="Ready to download as PDF"/>
    </section>
    <div className="content-grid workspace-grid">
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Recent invoices</div><div className="panel-subtitle">Open a saved invoice to edit or download it.</div></div><button className="button small" onClick={onNewInvoice}><Plus size={14}/> New invoice</button></div>
        <div className="saved-list">{invoices.length ? invoices.slice(0, 8).map(invoice => <div className="saved-invoice" key={invoice.id}><div className="invoice-icon"><FileText size={15}/></div><button onClick={() => onOpenInvoice(invoice)} className="saved-info link-button"><strong>{invoice.clientName || "Untitled client"}</strong><small>{invoice.number} · {invoice.createdAt}</small></button><span className="saved-amount">{money(invoice.total, invoice.currency)}</span><button className={`status-toggle ${invoice.status === "paid" ? "is-paid" : ""}`} onClick={() => onTogglePaid(invoice)}>{invoice.status === "paid" ? "Paid" : "Mark paid"}</button></div>) : <div className="empty-state">No saved invoices yet. Start with a new invoice.</div>}</div>
      </section>
      <section className="panel panel-body"><div className="panel-title">Quick summary</div><div className="summary-row"><span>Invoices created</span><strong>{invoices.length}</strong></div><div className="summary-row"><span>Client records</span><strong>{clients.length}</strong></div><div className="summary-row"><span>Expenses tracked</span><strong>{expenses.length}</strong></div><div className="summary-row total"><span>Paid revenue after expenses</span><strong>{money(revenue - spend, currency)}</strong></div></section>
    </div>
  </>;
}

function Clients({ clients, onAdd, onDelete, onToast }: { clients: Client[]; onAdd: (client: Omit<Client, "id">) => void; onDelete: (id: string) => void; onToast: (message: string) => void }) {
  const [adding, setAdding] = useState(false); const [query, setQuery] = useState("");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [address, setAddress] = useState("");
  const filtered = clients.filter(client => `${client.name} ${client.email} ${client.address}`.toLowerCase().includes(query.toLowerCase()));
  function submit(event: React.FormEvent) { event.preventDefault(); if (!name.trim()) { onToast("Enter a client or company name"); return; } onAdd({ name: name.trim(), email: email.trim(), address: address.trim() }); setName(""); setEmail(""); setAddress(""); setAdding(false); onToast("Client saved"); }
  return <section className="panel"><div className="panel-head"><div><div className="panel-title">Client directory</div><div className="panel-subtitle">{clients.length} client{clients.length === 1 ? "" : "s"} saved locally</div></div><button className="button primary small" onClick={() => setAdding(!adding)}><Plus size={14}/>{adding ? "Close form" : "Add client"}</button></div>
    {adding && <form className="panel-body form-grid client-form" onSubmit={submit}><Field label="Client / company name"><input value={name} onChange={event => setName(event.target.value)} required placeholder="Acme Studio"/></Field><Field label="Email address"><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="billing@company.com"/></Field><Field label="Billing address" className="full"><input value={address} onChange={event => setAddress(event.target.value)} placeholder="Street, city, country"/></Field><div className="full"><button className="button primary small" type="submit">Save client</button></div></form>}
    <div className="directory-toolbar"><label className="search-box"><Search size={15}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search clients"/></label><span>{filtered.length} shown</span></div>
    {filtered.length ? <div className="table-wrap"><table className="directory-table"><thead><tr><th>CLIENT</th><th>EMAIL</th><th>ADDRESS</th><th/></tr></thead><tbody>{filtered.map(client => <tr key={client.id}><td><strong>{client.name}</strong></td><td>{client.email ? <a href={`mailto:${client.email}`}>{client.email}</a> : <span className="dim">No email</span>}</td><td>{client.address || <span className="dim">No address</span>}</td><td><button className="remove-row" aria-label={`Delete ${client.name}`} onClick={() => onDelete(client.id)}><Trash2 size={14}/></button></td></tr>)}</tbody></table></div> : <div className="empty-state panel-empty"><Users size={22}/><p>{query ? "No clients match your search." : "Clients from saved invoices appear here. Add your first client to get started."}</p></div>}
  </section>;
}

function Expenses({ expenses, currency, onAdd, onDelete }: { expenses: Expense[]; currency: string; onAdd: (expense: Omit<Expense, "id">) => void; onDelete: (id: string) => void }) {
  const [adding, setAdding] = useState(false); const [description, setDescription] = useState(""); const [category, setCategory] = useState("Software"); const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); const [amount, setAmount] = useState("");
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  function submit(event: React.FormEvent) { event.preventDefault(); const value = Number(amount); if (!description.trim() || !Number.isFinite(value) || value <= 0) return; onAdd({ description: description.trim(), category, date, amount: value }); setDescription(""); setAmount(""); setAdding(false); }
  return <><section className="stats expense-stats"><Stat label="Total tracked" value={money(total, currency)} icon={<Wallet size={15}/>} foot="All recorded expenses"/><Stat label="Expense entries" value={String(expenses.length)} icon={<FileText size={15}/>} foot="Stored on this device"/></section>
    <section className="panel"><div className="panel-head"><div><div className="panel-title">Expense log</div><div className="panel-subtitle">Record software, travel, supplies, and other costs.</div></div><button className="button primary small" onClick={() => setAdding(!adding)}><Plus size={14}/>{adding ? "Close form" : "Add expense"}</button></div>
      {adding && <form className="panel-body form-grid expense-form" onSubmit={submit}><Field label="Description"><input required value={description} onChange={event => setDescription(event.target.value)} placeholder="Design software subscription"/></Field><Field label="Category"><select value={category} onChange={event => setCategory(event.target.value)}><option>Software</option><option>Travel</option><option>Supplies</option><option>Meals</option><option>Contractors</option><option>Other</option></select></Field><Field label="Date"><input required type="date" value={date} onChange={event => setDate(event.target.value)}/></Field><Field label={`Amount (${currency})`}><input required type="number" min="0.01" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} placeholder="0.00"/></Field><div className="full"><button className="button primary small" type="submit">Save expense</button></div></form>}
      {expenses.length ? <div className="table-wrap"><table className="directory-table"><thead><tr><th>DESCRIPTION</th><th>CATEGORY</th><th>DATE</th><th className="align-right">AMOUNT</th><th/></tr></thead><tbody>{expenses.slice().sort((a, b) => b.date.localeCompare(a.date)).map(expense => <tr key={expense.id}><td><strong>{expense.description}</strong></td><td><span className="category-pill">{expense.category}</span></td><td>{expense.date}</td><td className="align-right"><strong>{money(expense.amount, currency)}</strong></td><td><button className="remove-row" aria-label={`Delete ${expense.description}`} onClick={() => onDelete(expense.id)}><Trash2 size={14}/></button></td></tr>)}</tbody></table></div> : <div className="empty-state panel-empty"><Wallet size={22}/><p>No expenses recorded. Add your first expense to keep track of business costs.</p></div>}
    </section></>;
}

function Settings({ profile, onSave, onToast }: { profile: Profile; onSave: (profile: Profile) => void; onToast: (message: string) => void }) {
  const [form, setForm] = useState(profile);
  function submit(event: React.FormEvent) { event.preventDefault(); if (!form.name.trim() || !form.email.trim() || !form.businessName.trim()) { onToast("Name, email, and business name are required"); return; } onSave({ ...form, name: form.name.trim(), email: form.email.trim(), businessName: form.businessName.trim() }); onToast("Profile and invoice defaults saved"); }
  return <div className="settings-layout"><section className="panel"><div className="panel-head"><div><div className="panel-title">Profile</div><div className="panel-subtitle">Your name appears in the workspace menu.</div></div></div><form className="panel-body form-grid" onSubmit={submit}><Field label="Your name"><input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} required placeholder="Your name"/></Field><Field label="Email address"><input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} required placeholder="you@example.com"/></Field><div className="divider full"/><div className="full settings-section-label">Invoice defaults</div><Field label="Business name"><input value={form.businessName} onChange={event => setForm({ ...form, businessName: event.target.value })} required/></Field><Field label="Default currency"><select value={form.currency} onChange={event => setForm({ ...form, currency: event.target.value })}><option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option><option value="GBP">GBP — Pound Sterling</option><option value="CAD">CAD — Canadian Dollar</option><option value="AUD">AUD — Australian Dollar</option><option value="INR">INR — Indian Rupee</option></select></Field><div className="full"><button className="button primary" type="submit">Save settings</button></div></form></section><section className="panel panel-body settings-note"><div className="invoice-icon"><ShieldIcon/></div><div className="panel-title">Saved on this device</div><p>Your profile, client list, expenses, and invoices are kept in this browser. No account or cloud sync is required.</p></section></div>;
}

function Help({ onToast }: { onToast: (message: string) => void }) {
  return <div className="help-grid"><section className="panel"><div className="panel-head"><div><div className="panel-title">Frequently asked questions</div><div className="panel-subtitle">A few useful tips to get you started.</div></div></div><div className="faq-list"><details open><summary>How do I create an invoice?</summary><p>Choose Invoices in the sidebar, fill in the business and client details, add line items, then save or download a PDF.</p></details><details><summary>Where are my invoices and expenses stored?</summary><p>They’re saved locally in this browser on this device. Clearing browser storage will remove them, so download any PDFs you need to keep.</p></details><details><summary>Can I change my name and invoice currency?</summary><p>Yes. Open Settings in the sidebar, update your profile or default currency, and save your changes.</p></details><details><summary>How do I reuse a client?</summary><p>The Clients page keeps client details from your saved invoices. You can also add client records there directly.</p></details></div></section><section className="panel panel-body"><div className="invoice-icon"><CircleHelp size={16}/></div><div className="panel-title" style={{ marginTop: 12 }}>Need a hand?</div><p className="panel-subtitle" style={{ lineHeight: 1.7 }}>Send a note and include the invoice number if your question is about a particular invoice.</p><a className="button small" href="mailto:support@papertrail.example"><Mail size={14}/> Email support</a><button className="button small help-tip" onClick={() => onToast("Papertrail keeps your data in this browser")}>About local storage <ArrowUpRight size={13}/></button></section></div>;
}

function Stat({ label, value, icon, foot }: { label: string; value: string; icon: React.ReactNode; foot: string }) { return <div className="stat-card"><div className="stat-top">{label}<span className="stat-icon">{icon}</span></div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>; }
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) { return <div className={`field ${className}`}><label>{label}</label>{children}</div>; }
function ShieldIcon() { return <ArrowUpRight size={16}/>; }
