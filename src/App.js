import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageProvider, useLang } from "./LanguageContext";
import "./styles.css";
import "./App.css";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const api = axios.create({ baseURL: API });
api.interceptors.request.use((cfg) => { const t = localStorage.getItem("admin_token"); if (t) cfg.headers.Authorization = `Bearer ${t}`; return cfg; });

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-switcher" data-testid="lang-switcher">
      {["uz", "ru", "en"].map((l) => (
        <button key={l} onClick={() => setLang(l)} className={lang === l ? "active" : ""} data-testid={`lang-btn-${l}`}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

function Header() {
  const { t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [["/", t.nav.home], ["/products", t.nav.products], ["/news", t.nav.news], ["/gallery", t.nav.gallery], ["/jobs", t.nav.jobs], ["/contact", t.nav.contact]];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 980) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header ${menuOpen ? "menu-open" : ""}`} >
      <div className="container nav-wrap img">
        <div className="brand">
          <img src="/assets/image-removebg-preview.png" alt="logo" />
        </div>

        <button
          type="button"
          className={`menu-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? t.nav.close : t.nav.menu}
          aria-expanded={menuOpen}
          data-testid="menu-toggle"
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-panel ${menuOpen ? "open" : ""}`}>
          <nav>
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={closeMenu}
                className={({ isActive }) => isActive ? "active" : ""}
                data-testid={`nav-${to.replace("/", "") || "home"}`}
              >
                {label}
              </NavLink>
            ))}
            {/* <NavLink to="/admin" onClick={closeMenu} className="admin-link" data-testid="nav-admin">{t.nav.admin}</NavLink> */}
          </nav>
          <LangSwitcher />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { t, tr } = useLang();
  const [contact, setContact] = useState(null);
  useEffect(() => { api.get("/contact-info").then(r => setContact(r.data)).catch(() => {}); }, []);
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div><h3>MERRYMED FARM</h3><p>{t.footer.about}</p>{contact && <p>{tr(contact.address)}</p>}</div>
        <div>
          <h3>{t.footer.contact}</h3>
          {contact?.phones?.map((p, i) => <p key={i}>{tr(p.label)}: <a href={`tel:${p.value.replace(/\D/g, "")}`}>{p.value}</a></p>)}
          {contact && <p>Email: <a href={`mailto:${contact.email}`}>{contact.email}</a></p>}
        </div>
      </div>
      <div className="footer-bottom">{t.footer.rights}</div>
    </footer>
  );
}

function Hero() {
  const { t } = useLang();
  const slides = ["/assets/hero1.jpg", "/assets/hero2.jpg", "/assets/hero3.jpg"];
  const [cur, setCur] = useState(0);
  useEffect(() => { const id = setInterval(() => setCur(p => (p + 1) % slides.length), 4000); return () => clearInterval(id); }, []);
  return (
    <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(2,14,42,.88), rgba(7,73,145,.52)), url(${slides[cur]})` }}>
      <div className="container hero-content">
        <motion.div key={cur} {...fade}>
          <span className="eyebrow">{t.hero.eyebrow}</span>
          <h1>{t.hero.title}</h1>
          <p>{t.hero.subtitle}</p>
          <div className="hero-actions">
            <a href="#about" className="btn btn-primary" data-testid="hero-cta1">{t.hero.cta1}</a>
            <NavLink to="/contact" className="btn btn-secondary" data-testid="hero-cta2">{t.hero.cta2}</NavLink>
          </div>
        </motion.div>
        <div className="slider-indicators">
          {slides.map((_, i) => <button key={i} className={i === cur ? "active" : ""} onClick={() => setCur(i)}>0{i + 1}</button>)}
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const { t, tr } = useLang();
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  useEffect(() => {
    api.get("/company").then(r => setCompany(r.data));
    api.get("/products").then(r => setProducts(r.data));
    api.get("/news").then(r => setNews(r.data));
    api.get("/gallery").then(r => setGallery(r.data));
  }, []);
  return (
    <>
      <Hero />
      <motion.section className="section" {...fade}>
        <div className="container two-col" id="about">
          <div>
            <span className="eyebrow blue">{t.home.about_eyebrow}</span>
            <h2>{t.home.about_title}</h2>
            <p>{t.home.about_text}</p>
            <p>{t.home.mission}</p>
          </div>
          <div className="image-stack"><img src="/assets/control1.jpg" alt="factory" /></div>
        </div>
      </motion.section>
      {company && (
        <section className="metrics"><div className="container metric-grid">
          {company.metrics.map((m, i) => (
            <motion.div key={i} className="metric-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <strong>{m.value}</strong><span>{tr(m.label)}</span>
            </motion.div>
          ))}
        </div></section>
      )}
      <section className="section muted"><div className="container">
        <div className="section-heading"><span className="eyebrow blue">{t.home.highlights_eyebrow}</span><h2>{t.home.highlights_title}</h2></div>
        <div className="card-grid thirds">
          {t.highlights.map((h, i) => (
            <motion.article key={i} className="info-card feature-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} whileHover={{ y: -6 }}>
              <div className="icon-badge">✦</div><h3>{h.title}</h3><p>{h.text}</p>
            </motion.article>
          ))}
        </div>
      </div></section>
      <section className="section"><div className="container">
        <div className="section-heading with-action"><div><span className="eyebrow blue">{t.home.products_eyebrow}</span><h2>{t.home.products_title}</h2></div><NavLink to="/products" className="text-link">{t.home.see_all}</NavLink></div>
        <div className="card-grid thirds">{products.slice(0, 6).map((p) => (
          <motion.article key={p.id} className="info-card" whileHover={{ y: -4 }}><span className="pill">{tr(p.category)}</span><h3>{tr(p.name)}</h3><p>{tr(p.description)}</p></motion.article>
        ))}</div>
      </div></section>
      <section className="section gradient-panel"><div className="container">
        <div className="section-heading with-action light"><div><span className="eyebrow">{t.home.news_eyebrow}</span><h2>{t.home.news_title}</h2></div><NavLink to="/news" className="text-link light">{t.home.go_news}</NavLink></div>
        <div className="card-grid thirds">{news.slice(0, 3).map((n) => (
          <motion.article key={n.id} className="info-card dark" whileHover={{ y: -4 }}><small>{new Date(n.date).toLocaleDateString()}</small><h3>{tr(n.title)}</h3><p>{tr(n.excerpt)}</p></motion.article>
        ))}</div>
      </div></section>
      <section className="section"><div className="container">
        <div className="section-heading with-action"><div><span className="eyebrow blue">{t.home.gallery_eyebrow}</span><h2>{t.home.gallery_title}</h2></div><NavLink to="/gallery" className="text-link">{t.home.more}</NavLink></div>
        <div className="gallery-grid">{gallery.slice(0, 5).map((g) => (
          <motion.figure key={g.id} className="gallery-card" whileHover={{ scale: 1.03 }}><img src={g.image} alt={tr(g.title)} /><figcaption>{tr(g.title)}</figcaption></motion.figure>
        ))}</div>
      </div></section>
      <ContactBlock />
    </>
  );
}

function SubHero({ title, subtitle }) {
  return <section className="subhero"><div className="container"><span className="eyebrow">MERRYMED FARM</span><h1>{title}</h1><p>{subtitle}</p></div></section>;
}

function ProductsPage() {
  const { t, tr } = useLang();
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(t.contact.all);
  useEffect(() => { api.get("/products").then(r => setItems(r.data)); }, []);
  const cats = [t.contact.all, ...new Set(items.map((i) => tr(i.category)))];
  const filtered = active === t.contact.all ? items : items.filter((i) => tr(i.category) === active);
  return (<><SubHero title={t.pages.products.title} subtitle={t.pages.products.subtitle} /><section className="section"><div className="container">
    <div className="filter-row">{cats.map((c) => <button key={c} className={active === c ? "chip active" : "chip"} onClick={() => setActive(c)}>{c}</button>)}</div>
    <div className="card-grid thirds">{filtered.map((p) => (
      <motion.article key={p.id} className="info-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ y: -4 }}><span className="pill">{tr(p.category)}</span><h3>{tr(p.name)}</h3><p>{tr(p.description)}</p></motion.article>
    ))}</div>
  </div></section></>);
}

function NewsPage() {
  const { t, tr } = useLang();
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/news").then(r => setItems(r.data)); }, []);
  return (<><SubHero title={t.pages.news.title} subtitle={t.pages.news.subtitle} /><section className="section"><div className="container">
    <div className="timeline">{items.map((n, i) => (
      <motion.article key={n.id} className="timeline-card" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}><small>{new Date(n.date).toLocaleDateString()}</small><h3>{tr(n.title)}</h3><p>{tr(n.excerpt)}</p></motion.article>
    ))}</div>
  </div></section></>);
}

function GalleryPage() {
  const { t, tr } = useLang();
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/gallery").then(r => setItems(r.data)); }, []);
  return (<><SubHero title={t.pages.gallery.title} subtitle={t.pages.gallery.subtitle} /><section className="section"><div className="container">
    <div className="gallery-grid gallery-full">{items.map((g, i) => (
      <motion.figure key={g.id} className="gallery-card" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }} whileHover={{ scale: 1.03 }}><img src={g.image} alt={tr(g.title)} /><figcaption>{tr(g.title)}</figcaption></motion.figure>
    ))}</div>
  </div></section></>);
}

function JobsPage() {
  const { t } = useLang();
  return (<><SubHero title={t.pages.jobs.title} subtitle={t.pages.jobs.subtitle} /><section className="section"><div className="container">
    <div className="card-grid">{t.jobs.map((j, i) => (
      <motion.article key={i} className="info-card" whileHover={{ y: -4 }}><h3>{j.title}</h3><p><strong>{j.location}</strong></p><p>{j.type}</p><button className="btn btn-secondary">{t.contact.apply}</button></motion.article>
    ))}</div>
  </div></section></>);
}

function ContactBlock() {
  const { t, tr } = useLang();
  const [contact, setContact] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  useEffect(() => { api.get("/contact-info").then(r => setContact(r.data)); }, []);
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/contact", form); setStatus(t.contact.sent); setForm({ name: "", email: "", message: "" }); }
    catch { setStatus(t.contact.error); }
  };
  return (<section className="section muted"><div className="container contact-grid">
    <div>
      <span className="eyebrow blue">{t.contact.eyebrow}</span>
      <h2>{t.contact.title}</h2>
      {contact && <>
        <p>{tr(contact.address)}</p>
        <ul className="contact-list">
          {contact.phones.map((p, i) => <li key={i}><strong>{tr(p.label)}:</strong> {p.value}</li>)}
          <li><strong>{t.contact.email_label}:</strong> {contact.email}</li>
          <li><strong>{t.contact.index}:</strong> {contact.index}</li>
        </ul>
      </>}
    </div>
    <form className="contact-form" onSubmit={submit} data-testid="contact-form">
      <input placeholder={t.contact.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="contact-name" />
      <input type="email" placeholder={t.contact.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required data-testid="contact-email" />
      <textarea rows="5" placeholder={t.contact.message} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required data-testid="contact-message" />
      <button className="btn btn-primary" type="submit" data-testid="contact-submit">{t.contact.send}</button>
      {status && <p className="form-status">{status}</p>}
    </form>
  </div></section>);
}

function ContactPage() {
  const { t } = useLang();
  return (<><SubHero title={t.pages.contact.title} subtitle={t.pages.contact.subtitle} /><ContactBlock /></>);
}

// ============ ADMIN ============
function AdminLogin({ onLogin }) {
  const { t } = useLang();
  const [email, setEmail] = useState("admin@merrymed.uz");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try { const r = await api.post("/auth/login", { email, password }); localStorage.setItem("admin_token", r.data.access_token); onLogin(); }
    catch { setErr(t.admin.loginFail); }
  };
  return (<div className="admin-login"><form onSubmit={submit} data-testid="admin-login-form">
    <h2>{t.admin.title}</h2>
    <input type="email" placeholder={t.admin.email} value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="admin-email" />
    <input type="password" placeholder={t.admin.password} value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="admin-password" />
    <button className="btn btn-primary" type="submit" data-testid="admin-login-submit">{t.admin.login}</button>
    {err && <p className="form-status" data-testid="admin-login-error">{err}</p>}
  </form></div>);
}

const emptyI18n = () => ({ uz: "", ru: "", en: "" });
const ENTITIES = {
  products: { fields: ["category", "name", "description"], empty: () => ({ category: emptyI18n(), name: emptyI18n(), description: emptyI18n() }) },
  news: { fields: ["title", "excerpt"], extra: "date", empty: () => ({ date: new Date().toISOString().slice(0, 10), title: emptyI18n(), excerpt: emptyI18n() }) },
  gallery: { fields: ["title"], extra: "image", empty: () => ({ title: emptyI18n(), image: "/assets/hero1.jpg" }) },
};

function AdminCrud({ entity }) {
  const { t } = useLang();
  const conf = ENTITIES[entity];
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => api.get(`/${entity}`).then((r) => setItems(r.data));
  useEffect(() => { load(); }, [entity]);
  const save = async () => {
    try {
      if (editing.id) await api.put(`/admin/${entity}/${editing.id}`, editing);
      else await api.post(`/admin/${entity}`, editing);
      setEditing(null); load();
    } catch (e) { alert("Error: " + (e.response?.data?.detail || e.message)); }
  };
  const del = async (id) => { if (!window.confirm(t.admin.confirm)) return; await api.delete(`/admin/${entity}/${id}`); load(); };
  return (<div className="admin-crud">
    <div className="admin-crud-header"><h3>{t.admin[entity]}</h3><button className="btn btn-primary" onClick={() => setEditing(conf.empty())} data-testid={`add-${entity}`}>+ {t.admin.add}</button></div>
    <div className="admin-list">{items.map((item) => (
      <div key={item.id} className="admin-item" data-testid={`${entity}-item`}>
        <div>{item.title ? (item.title.uz || item.title.en) : (item.name?.uz || item.name?.en)}</div>
        <div className="admin-actions">
          <button onClick={() => setEditing({ ...item })} data-testid={`edit-${entity}-${item.id}`}>{t.admin.edit}</button>
          <button className="danger" onClick={() => del(item.id)} data-testid={`delete-${entity}-${item.id}`}>{t.admin.delete}</button>
        </div>
      </div>
    ))}</div>
    <AnimatePresence>{editing && (
      <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditing(null)}>
        <motion.div className="modal" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
          <h3>{editing.id ? t.admin.edit : t.admin.add}</h3>
          {conf.extra === "date" && (<div className="field"><label>Date</label><input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>)}
          {conf.extra === "image" && (<div className="field"><label>Image URL</label><input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} /></div>)}
          {conf.fields.map((f) => (
            <div key={f} className="field"><label>{f}</label>
              {["uz", "ru", "en"].map((lng) => (
                <input key={lng} placeholder={lng.toUpperCase()} value={editing[f]?.[lng] || ""} onChange={(e) => setEditing({ ...editing, [f]: { ...editing[f], [lng]: e.target.value } })} data-testid={`field-${f}-${lng}`} />
              ))}
            </div>
          ))}
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>{t.admin.cancel}</button>
            <button className="btn btn-primary" onClick={save} data-testid="admin-save">{t.admin.save}</button>
          </div>
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  </div>);
}

function AdminPanel() {
  const { t } = useLang();
  const [authed, setAuthed] = useState(!!localStorage.getItem("admin_token"));
  const [tab, setTab] = useState("products");
  const nav = useNavigate();
  useEffect(() => { if (authed) api.get("/auth/me").catch(() => { localStorage.removeItem("admin_token"); setAuthed(false); }); }, [authed]);
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return (<div className="admin-panel"><div className="container">
    <div className="admin-header"><h1>{t.admin.title}</h1><button className="btn btn-secondary" onClick={() => { localStorage.removeItem("admin_token"); setAuthed(false); nav("/"); }} data-testid="admin-logout">{t.admin.logout}</button></div>
    <div className="admin-tabs">
      {["products", "news", "gallery"].map((e) => (<button key={e} onClick={() => setTab(e)} className={tab === e ? "active" : ""} data-testid={`tab-${e}`}>{t.admin[e]}</button>))}
    </div>
    <AdminCrud entity={tab} />
  </div></div>);
}

function AppInner() {
  return (<div className="app-shell"><Header />
    <main><AnimatePresence mode="wait"><Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes></AnimatePresence></main>
    <Footer />
  </div>);
}

export default function App() {
  return <LanguageProvider><BrowserRouter><AppInner /></BrowserRouter></LanguageProvider>;
}
