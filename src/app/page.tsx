"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, ArrowDownLeft, ArrowUpRight, Bell, BriefcaseBusiness, CalendarDays, Check, ChevronDown, CircleHelp, Clock3, FilePlus2, FileText, LayoutDashboard, Plus, ReceiptText, Settings, ShieldCheck, Sparkles, Trash2, Users, Wallet, X } from "lucide-react";
import type { InvoiceData, InvoiceLine } from "@/components/InvoicePdf";
import { WorkspaceView, type Client, type Expense, type Profile, type SavedInvoice } from "@/components/WorkspaceViews";

const PdfDownload = dynamic(
  () => import("@/components/PdfDownload"),
  { ssr: false, loading: () => <span className="button primary small">SHORTWITHZAYN PDF…</span> },
);

const schema = z.object({ number: z.string().min(1, "Add an invoice number"), issueDate: z.string().min(1), dueDate: z.string().min(1), fromName: z.string().min(1, "Add your business name"), fromEmail: z.string().email("Enter a valid email"), fromAddress: z.string(), clientName: z.string().min(1, "Add a client name"), clientEmail: z.string(), clientAddress: z.string(), notes: z.string(), taxRate: z.coerce.number().min(0).max(100), currency: z.string() });
type Fields = z.infer<typeof schema>;
const today = new Date().toISOString().slice(0, 10);
const monthAhead = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
const freshFields = (): Fields => ({ number: `INV-${new Date().getFullYear()}-001`, issueDate: today, dueDate: monthAhead, fromName: "", fromEmail: "", fromAddress: "", clientName: "", clientEmail: "", clientAddress: "", notes: "", taxRate: 0, currency: "INR" });
const money = (value: number, currency: string) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);

export default function Home() {
  const [items, setItems] = useState<InvoiceLine[]>([]);
  const [saved, setSaved] = useState<SavedInvoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profile, setProfile] = useState<Profile>({ name: "Md Aftab", email: "mda94132@gmail.com", businessName: "Invoice Generator", currency: "INR" });
  const [toast, setToast] = useState("");
  const [activeNav, setActiveNav] = useState("Invoices");
  const [hydrated, setHydrated] = useState(false);
  const { register, watch, reset, getValues, formState: { errors } } = useForm<Fields>({ resolver: zodResolver(schema), defaultValues: freshFields() });
  const fields = watch();
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.rate) || 0), 0), [items]);
  const tax = subtotal * (Number(fields.taxRate) || 0) / 100;
  const total = subtotal + tax;
  const pdfData: InvoiceData = { ...fields, taxRate: Number(fields.taxRate) || 0, items };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("SHORTWITHZAYN-invoices-v1") ?? localStorage.getItem("papertrail-invoices-v1");
      if (raw) {
        const data = JSON.parse(raw);
        if (data.fields) {
          const fields = { ...freshFields(), ...data.fields };
          const sampleValues: Record<string, string> = { fromName: "MD AFTAB", fromEmail: "Mda94132@gmail.com", fromAddress: "Samastip, BR", clientName: "Client Name.", clientEmail: "Clientaccounts@Name.co", clientAddress: "Client, Address, Details", notes: "Thank you for trusting me with this project. Payment is due within 30 days." };
          for (const [key, value] of Object.entries(sampleValues)) if (fields[key as keyof Fields] === value) fields[key as keyof Fields] = "" as Fields[keyof Fields];
          if (fields.taxRate === 8) fields.taxRate = 0;
          reset(fields);
        }
        if (Array.isArray(data.items)) {
          const sampleItems = ["Brand identity design", "Website design & prototyping", "Creative direction"];
          setItems(data.items.length === 3 && data.items.every((item: InvoiceLine) => sampleItems.includes(item.description)) ? [] : data.items);
        }
        if (data.saved) setSaved(data.saved.map((invoice: SavedInvoice) => ({ status: "unpaid", ...invoice })));
        if (data.clients) setClients(data.clients);
        if (data.expenses) setExpenses(data.expenses);
        if (data.profile) setProfile({ ...data.profile, name: data.profile.name === "Olivia Chen" ? "Md Aftab" : data.profile.name });
      }
    } catch { /* Start with the ready-to-edit example invoice if storage is unavailable. */ }
    setHydrated(true);
  }, [reset]);
  useEffect(() => { if (!hydrated) return; localStorage.setItem("SHORTWITHZAYN-invoices-v1", JSON.stringify({ fields, items, saved, clients, expenses, profile })); }, [fields, items, saved, clients, expenses, profile, hydrated]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 2600); return () => clearTimeout(timer); }, [toast]);

  function updateItem(id: string, key: "description" | "qty" | "rate", value: string) { setItems(rows => rows.map(item => item.id === id ? { ...item, [key]: key === "description" ? value : Math.max(0, Number(value)) } : item)); }
  function addItem() { setItems(rows => [...rows, { id: crypto.randomUUID(), description: "", qty: 1, rate: 0 }]); }
  function saveInvoice() {
    const parsed = schema.safeParse({ ...getValues(), taxRate: Number(getValues("taxRate")) });
    if (!parsed.success) { setToast("Check the highlighted invoice details"); return; }
    const previous = saved.find(invoice => invoice.number === parsed.data.number);
    const record: SavedInvoice = { ...parsed.data, items, id: previous?.id ?? crypto.randomUUID(), createdAt: previous?.createdAt ?? today, status: previous?.status ?? "unpaid", paidAt: previous?.paidAt, total };
    setSaved(rows => [record, ...rows.filter(row => row.number !== record.number)].slice(0, 20));
    setClients(rows => rows.some(client => client.name.toLowerCase() === record.clientName.toLowerCase()) ? rows : [...rows, { id: crypto.randomUUID(), name: record.clientName, email: record.clientEmail, address: record.clientAddress }]);
    setToast("Invoice saved to this device");
  }
  function newInvoice() { reset({ ...freshFields(), number: `INV-${new Date().getFullYear()}-${String(saved.length + 1).padStart(3, "0")}` }); setItems([]); setToast("Blank invoice ready"); }
  function openInvoice(invoice: SavedInvoice) { reset(invoice); setItems(invoice.items); setToast(`Opened ${invoice.number}`); }
  function togglePaid(invoice: SavedInvoice) { setSaved(rows => rows.map(row => row.id === invoice.id ? row.status === "paid" ? { ...row, status: "unpaid", paidAt: undefined } : { ...row, status: "paid", paidAt: today } : row)); }
  const thisMonth = today.slice(0, 7);
  const paidThisMonth = saved.filter(invoice => invoice.status === "paid" && invoice.paidAt?.slice(0, 7) === thisMonth).reduce((sum, invoice) => sum + invoice.total, 0);
  const outstanding = saved.filter(invoice => invoice.status !== "paid").reduce((sum, invoice) => sum + invoice.total, 0);
  const paidInvoices = saved.filter(invoice => invoice.status === "paid" && invoice.paidAt);
  const averageDaysToPay = paidInvoices.length ? Math.round(paidInvoices.reduce((sum, invoice) => sum + Math.max(0, Math.floor((Date.parse(`${invoice.paidAt}T00:00:00`) - Date.parse(`${invoice.issueDate}T00:00:00`)) / 86400000)), 0) / paidInvoices.length) : null;
  const initials = profile.name.trim().split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase() || "ME";
  function saveProfile(nextProfile: Profile) { setProfile(nextProfile); reset({ ...getValues(), fromName: nextProfile.businessName, fromEmail: nextProfile.email, currency: nextProfile.currency }); }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><ReceiptText size={17}/></div><span className="brand-name">SHORTWITHZAYN</span></div>
      <div className="workspace-label">Workspace</div>
      <nav>
        {[{ name: "Overview", icon: LayoutDashboard }, { name: "Invoices", icon: FileText }, { name: "Clients", icon: Users }, { name: "Expenses", icon: Wallet }].map(({ name, icon: Icon }) => <button key={name} onClick={() => setActiveNav(name)} className={`nav-item ${activeNav === name ? "active" : ""}`}><Icon size={17}/><span>{name}</span>{name === "Invoices" && <span className="nav-count">{saved.length || 4}</span>}</button>)}
      </nav>
      <div className="workspace-label" style={{ marginTop: 28 }}>Preferences</div>
      {[{ name: "Settings", icon: Settings }, { name: "Help & support", icon: CircleHelp }].map(({ name, icon: Icon }) => <button key={name} onClick={() => setActiveNav(name === "Settings" ? "Settings" : "Help & support")} className={`nav-item ${activeNav === name ? "active" : ""}`}><Icon size={17}/><span>{name}</span></button>)}
      <div className="side-bottom"><div className="upgrade-card"><Sparkles size={16} color="#49856a"/><strong>Make admin feel easy</strong><p>Spend less time chasing invoices and more time doing what you love.</p><button onClick={() => setToast("SHORTWITHZAYN is ready to use on this device")}>Explore SHORTWITHZAYN <ArrowUpRight size={12}/></button></div><button className="profile profile-button" onClick={() => setActiveNav("Settings")} aria-label="Edit profile settings"><div className="avatar">{initials}</div><div className="profile-info"><strong>{profile.name}</strong><small>{profile.email}</small></div><ChevronDown size={15} color="#929d96" style={{ marginLeft: "auto" }}/></button></div>
    </aside>
    <main className="main">
      <div className="topbar"><div className="crumb">Workspace <span style={{ padding: "0 7px" }}>/</span> <b>{activeNav}</b></div><div className="top-actions"><button className="icon-btn" aria-label="Help" onClick={() => setActiveNav("Help & support")}><CircleHelp size={16}/></button><button className="icon-btn" aria-label="Notifications" onClick={() => setToast(saved.length ? `You have ${saved.length} saved invoice${saved.length === 1 ? "" : "s"}` : "No new notifications")}><Bell size={16}/></button><button className="avatar avatar-button" aria-label="Edit profile settings" onClick={() => setActiveNav("Settings")}>{initials}</button></div></div>
      {activeNav !== "Invoices" ? <WorkspaceView view={activeNav === "Overview" ? "overview" : activeNav === "Clients" ? "clients" : activeNav === "Expenses" ? "expenses" : activeNav === "Settings" ? "settings" : "help"} invoices={saved} clients={clients} expenses={expenses} profile={profile} currency={fields.currency} onAddClient={client => setClients(rows => [...rows, { ...client, id: crypto.randomUUID() }])} onDeleteClient={id => setClients(rows => rows.filter(client => client.id !== id))} onAddExpense={expense => setExpenses(rows => [{ ...expense, id: crypto.randomUUID() }, ...rows])} onDeleteExpense={id => setExpenses(rows => rows.filter(expense => expense.id !== id))} onSaveProfile={saveProfile} onNewInvoice={() => { newInvoice(); setActiveNav("Invoices"); }} onOpenInvoice={invoice => { openInvoice(invoice); setActiveNav("Invoices"); }} onTogglePaid={togglePaid} onToast={setToast}/> : <>
      <div className="heading-row"><div><h1>Invoices</h1><p className="subtitle">Create, send, and keep track of your freelance invoices.</p></div><button className="button primary" onClick={newInvoice}><Plus size={16}/> New invoice</button></div>

      <section className="stats">
        <div className="stat-card"><div className="stat-top">Paid this month <span className="stat-icon"><ArrowDownLeft size={15}/></span></div><div className="stat-value">{money(paidThisMonth, fields.currency)}</div><div className="stat-foot">Invoices marked paid this month</div></div>
        <div className="stat-card"><div className="stat-top">Outstanding <span className="stat-icon"><Clock3 size={15}/></span></div><div className="stat-value">{money(outstanding, fields.currency)}</div><div className="stat-foot">{saved.filter(invoice => invoice.status !== "paid").length} unpaid invoice{saved.filter(invoice => invoice.status !== "paid").length === 1 ? "" : "s"}</div></div>
        <div className="stat-card"><div className="stat-top">Invoices created <span className="stat-icon"><FileText size={15}/></span></div><div className="stat-value">{saved.length}</div><div className="stat-foot">Saved invoices on this device</div></div>
        <div className="stat-card"><div className="stat-top">Avg. time to pay <span className="stat-icon"><Activity size={15}/></span></div><div className="stat-value">{averageDaysToPay === null ? "—" : <>{averageDaysToPay} <span style={{ fontSize: 13, color: "#7e8b83", fontWeight: 600 }}>days</span></>}</div><div className="stat-foot">{averageDaysToPay === null ? "Mark an invoice paid to start tracking" : `Based on ${paidInvoices.length} paid invoice${paidInvoices.length === 1 ? "" : "s"}`}</div></div>
      </section>

      <div className="content-grid">
        <section className="panel">
          <div className="panel-head"><div><div className="panel-title">Create invoice</div><div className="panel-subtitle">Fill in the details below to get started.</div></div><span className="status-label"><span style={{ width: 6, height: 6, borderRadius: 9, background: "#49a274" }}/> Draft</span></div>
          <div className="panel-body">
            <h2 className="section-title"><span><BriefcaseBusiness size={13}/></span> Your business</h2>
            <div className="form-grid">
              <Field label="Business name" error={errors.fromName?.message}><input {...register("fromName")} placeholder="Your business name" /></Field>
              <Field label="Email address" error={errors.fromEmail?.message}><input {...register("fromEmail")} placeholder="you@yourbusiness.com" /></Field>
              <Field label="Business address" className="full"><input {...register("fromAddress")} placeholder="Street, city, country" /></Field>
            </div>
            <div className="divider"/>
            <h2 className="section-title"><span><Users size={13}/></span> Client details</h2>
            <div className="form-grid">
              <Field label="Client / company name" error={errors.clientName?.message}><input {...register("clientName")} placeholder="Who are you billing?" /></Field>
              <Field label="Client email"><input {...register("clientEmail")} placeholder="client@company.com" /></Field>
              <Field label="Billing address" className="full"><input {...register("clientAddress")} placeholder="Street, city, country" /></Field>
            </div>
            <div className="divider"/>
            <h2 className="section-title"><span><FileText size={13}/></span> Invoice details</h2>
            <div className="form-grid">
              <Field label="Invoice number" error={errors.number?.message}><input {...register("number")} /></Field>
              <Field label="Currency"><select {...register("currency")}><option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option><option value="GBP">GBP — Pound Sterling</option><option value="CAD">CAD — Canadian Dollar</option><option value="AUD">AUD — Australian Dollar</option><option value="INR">INR — Indian Rupee</option></select></Field>
              <Field label="Issue date"><div style={{ position: "relative" }}><input type="date" {...register("issueDate")} /><CalendarDays size={14} style={{ position: "absolute", right: 11, top: 10, color: "#99a49d", pointerEvents: "none" }}/></div></Field>
              <Field label="Due date"><div style={{ position: "relative" }}><input type="date" {...register("dueDate")} /><CalendarDays size={14} style={{ position: "absolute", right: 11, top: 10, color: "#99a49d", pointerEvents: "none" }}/></div></Field>
            </div>
            <div className="divider"/>
            <h2 className="section-title"><span><ReceiptText size={13}/></span> Line items</h2>
            <div style={{ overflowX: "auto" }}><table className="items-table"><thead><tr><th style={{ width: "43%" }}>DESCRIPTION</th><th style={{ width: "14%", textAlign: "right" }}>QTY</th><th style={{ width: "21%", textAlign: "right" }}>RATE</th><th style={{ width: "18%", textAlign: "right" }}>AMOUNT</th><th style={{ width: 24 }}></th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td><input aria-label="Item description" value={item.description} placeholder="Service or product" onChange={e => updateItem(item.id, "description", e.target.value)}/></td><td><input className="num" aria-label="Quantity" type="number" min="0" value={item.qty} onChange={e => updateItem(item.id, "qty", e.target.value)}/></td><td><input className="num" aria-label="Rate" type="number" min="0" step="0.01" value={item.rate} onChange={e => updateItem(item.id, "rate", e.target.value)}/></td><td className="amount">{money((Number(item.qty) || 0) * (Number(item.rate) || 0), fields.currency)}</td><td><button aria-label="Remove line item" className="remove-row" onClick={() => setItems(rows => rows.filter(row => row.id !== item.id))}><X size={14}/></button></td></tr>)}</tbody></table></div>
            <button className="add-line" onClick={addItem}><Plus size={14}/> Add line item</button>
            <div className="form-grid" style={{ marginTop: 20 }}><Field label="Tax rate (%)"><input type="number" min="0" max="100" step="0.1" {...register("taxRate", { valueAsNumber: true })} /></Field><Field label="Note to client"><input {...register("notes")} placeholder="A short thank-you or payment note" /></Field></div>
            <div className="summary"><div className="summary-row"><span>Subtotal</span><strong>{money(subtotal, fields.currency)}</strong></div><div className="summary-row"><span>Tax ({Number(fields.taxRate) || 0}%)</span><strong>{money(tax, fields.currency)}</strong></div><div className="summary-row total"><span>Total due</span><strong>{money(total, fields.currency)}</strong></div></div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 17 }}><button className="button" onClick={newInvoice}><FilePlus2 size={15}/> New draft</button><button className="button primary" onClick={saveInvoice}><Check size={15}/> Save invoice</button></div>
          </div>
        </section>
        <div className="right-stack">
          <section className="panel preview-card"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 }}><div><div className="panel-title">Live preview</div><div className="panel-subtitle">Your PDF updates as you type.</div></div><span style={{ color: "#a2aca6", fontSize: 10 }}>A4 · PDF</span></div>
            <div className="invoice-paper"><div className="paper-top"><div><div className="paper-brand">{fields.fromName || "Your studio"}</div><div className="paper-meta">{fields.fromEmail}<br/>{fields.fromAddress}</div></div><div style={{ textAlign: "right" }}><div className="paper-type">INVOICE</div><div className="paper-meta">{fields.number}<br/>Due {fields.dueDate}</div></div></div><div className="paper-rule"/><div className="paper-meta" style={{ margin: 0 }}>BILL TO<br/><b style={{ color: "#47554c" }}>{fields.clientName || "Client name"}</b><br/>{fields.clientEmail}</div><div className="paper-rule"/>{items.slice(0, 3).map(item => <div key={item.id} className="paper-row"><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{item.description || "Line item"}</span><span>{money(item.qty * item.rate, fields.currency)}</span></div>)}{items.length > 3 && <div className="paper-row"><span>+ {items.length - 3} more items</span></div>}<div className="paper-rule"/><div className="paper-total"><span>Total due</span><span>{money(total, fields.currency)}</span></div></div>
            <div className="preview-actions"><PdfDownload data={pdfData} fileName={`${fields.number || "invoice"}.pdf`}/><button className="button small" onClick={() => { saveInvoice(); }}><ShieldCheck size={14}/> Save</button></div>
          </section>
          <section className="panel"><div className="panel-head"><div><div className="panel-title">Recent invoices</div><div className="panel-subtitle">Saved on this device</div></div><button className="button ghost small" onClick={() => setToast(saved.length ? `${saved.length} saved invoice${saved.length === 1 ? "" : "s"}` : "No saved invoices yet")}>View all <ArrowUpRight size={13}/></button></div>
            <div className="saved-list">{saved.length ? saved.slice(0, 4).map(invoice => <div className="saved-invoice" key={invoice.id}><div className="invoice-icon"><FileText size={15}/></div><button onClick={() => openInvoice(invoice)} className="saved-info" style={{ textAlign: "left", border: 0, background: "transparent", padding: 0 }}><strong>{invoice.clientName || "Untitled client"}</strong><small>{invoice.number} · {invoice.createdAt}</small></button><span className="saved-amount">{money(invoice.total, invoice.currency)}</span><button className={`status-toggle ${invoice.status === "paid" ? "is-paid" : ""}`} onClick={() => togglePaid(invoice)}>{invoice.status === "paid" ? "Paid" : "Mark paid"}</button><button className="remove-row" aria-label="Delete saved invoice" onClick={() => setSaved(rows => rows.filter(row => row.id !== invoice.id))}><Trash2 size={13}/></button></div>) : <div className="empty-state"><FileText size={21} style={{ margin: "0 auto 8px", color: "#bdc9c1" }}/><br/>Your saved invoices will show up here.</div>}</div>
          </section>
          <section className="panel" style={{ padding: 16, display: "flex", gap: 11, alignItems: "flex-start", background: "#f2f7f3", borderColor: "#e6eee8" }}><div className="invoice-icon" style={{ flexShrink: 0 }}><Sparkles size={15}/></div><div><strong style={{ fontSize: 11 }}>A little invoice tip</strong><p style={{ color: "#77857c", fontSize: 10, lineHeight: 1.5, margin: "5px 0 0" }}>Clear payment terms help you get paid faster. Your due date is shown prominently on every PDF.</p></div></section>
        </div>
      </div>
      </>}
    </main>
    {toast && <div className="toast">{toast}</div>}
  </div>;
}

function Field({ label, children, className = "", error }: { label: string; children: React.ReactNode; className?: string; error?: string }) {
  return <div className={`field ${className}`}><label>{label}</label>{children}{error && <span className="error">{error}</span>}</div>;
}
