import { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCfEty9V0fHN8uMcHREk9TVUdtTkDYMqbU",
  authDomain: "tus-citas.firebaseapp.com",
  databaseURL: "https://tus-citas-default-rtdb.firebaseio.com",
  projectId: "tus-citas",
  storageBucket: "tus-citas.firebasestorage.app",
  messagingSenderId: "941339040913",
  appId: "1:941339040913:web:f6af4381595b3a77783330",
};
const fbApp = initializeApp(firebaseConfig);
const db   = getFirestore(fbApp);
const auth = getAuth(fbApp);

// ── STYLES ───────────────────────────────────────────────────
const G = {
  bg:      "#07080d",
  surface: "#0e1018",
  card:    "#13151f",
  border:  "#1e2130",
  border2: "#262a3d",
  accent:  "#c8f026",
  accent2: "#4f8ef7",
  accent3: "#f7714f",
  text:    "#eef0f8",
  muted:   "#5a6080",
  muted2:  "#8890b0",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:${G.bg};color:${G.text};font-family:'DM Sans',sans-serif;font-size:14px}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:${G.surface}}
  ::-webkit-scrollbar-thumb{background:${G.border2};border-radius:4px}
  input,select,textarea{font-family:'DM Sans',sans-serif}
  table{border-collapse:collapse;width:100%}

  .layout{display:flex;min-height:100vh}
  .sidebar{width:232px;background:${G.surface};border-right:1px solid ${G.border};display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:100}
  .sb-logo{padding:24px 20px 20px;border-bottom:1px solid ${G.border};display:flex;align-items:center;gap:10px}
  .sb-logo-mark{background:${G.accent};width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:14px;color:${G.bg};flex-shrink:0}
  .sb-logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:16px;color:${G.text}}
  .sb-logo-sub{font-size:10px;color:${G.muted};font-weight:400}
  .sb-nav{flex:1;padding:12px 10px;overflow-y:auto}
  .sb-section{font-size:10px;font-weight:700;color:${G.muted};text-transform:uppercase;letter-spacing:1.5px;padding:12px 10px 6px}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;color:${G.muted2};transition:all .15s;margin-bottom:1px;border:1px solid transparent;position:relative}
  .nav-item:hover{color:${G.text};background:${G.card}}
  .nav-item.active{color:${G.bg};background:${G.accent};border-color:${G.accent}}
  .nav-item.active svg{color:${G.bg}!important}
  .nav-badge{background:${G.accent3};color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:999px;margin-left:auto}
  .sb-footer{padding:12px;border-top:1px solid ${G.border}}
  .coach-card{background:${G.card};border:1px solid ${G.border};border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:10px}
  .coach-av{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,${G.accent},${G.accent2});display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;color:${G.bg};flex-shrink:0}
  .coach-name{font-size:13px;font-weight:600;color:${G.text}}
  .coach-role{font-size:11px;color:${G.muted}}
  .logout-btn{background:none;border:none;cursor:pointer;color:${G.muted};padding:4px;border-radius:6px;transition:.15s;margin-left:auto}
  .logout-btn:hover{color:${G.accent3};background:${G.border}}

  .main{margin-left:232px;flex:1;padding:28px 32px;min-height:100vh}
  .page-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}
  .page-title{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:${G.text};letter-spacing:-0.5px}
  .page-sub{color:${G.muted2};font-size:13px;margin-top:4px}

  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
  .kpi{background:${G.card};border:1px solid ${G.border};border-radius:14px;padding:18px 20px;position:relative;overflow:hidden}
  .kpi::before{content:'';position:absolute;top:0;right:0;width:60px;height:60px;border-radius:0 14px 0 60px;opacity:.08}
  .kpi-label{font-size:11px;font-weight:700;color:${G.muted};text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
  .kpi-value{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;color:${G.text};letter-spacing:-1px}
  .kpi-sub{font-size:12px;color:${G.muted2};margin-top:4px}
  .kpi-icon{position:absolute;top:16px;right:16px;opacity:.15;font-size:28px}

  .card{background:${G.card};border:1px solid ${G.border};border-radius:14px;padding:20px}
  .card-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:${G.text};margin-bottom:16px;letter-spacing:.2px}
  .card-subtitle{font-size:12px;color:${G.muted2};margin-top:-10px;margin-bottom:16px}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}

  .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;transition:all .15s}
  .btn-primary{background:${G.accent};color:${G.bg}}
  .btn-primary:hover{background:#d4f540;transform:translateY(-1px)}
  .btn-secondary{background:${G.border};color:${G.text}}
  .btn-secondary:hover{background:${G.border2}}
  .btn-danger{background:#2a1a1a;color:${G.accent3};border:1px solid #3a2020}
  .btn-danger:hover{background:#3a2020}
  .btn-sm{padding:6px 12px;font-size:12px}
  .btn-icon{padding:7px;border-radius:8px}

  .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
  .badge-active{background:#0d2d1a;color:#4ade80;border:1px solid #1a4d2a}
  .badge-pending{background:#2d2510;color:#fbbf24;border:1px solid #4d3d10}
  .badge-inactive{background:#1e1e28;color:${G.muted2};border:1px solid ${G.border2}}
  .badge-goal{background:${G.border};color:${G.accent2};border:1px solid ${G.border2}}

  .inp{width:100%;padding:10px 13px;background:${G.surface};border:1.5px solid ${G.border};border-radius:10px;color:${G.text};font-size:13px;outline:none;transition:.15s;font-family:'DM Sans',sans-serif}
  .inp:focus{border-color:${G.accent};background:${G.card}}
  .inp::placeholder{color:${G.muted}}
  .lbl{display:block;font-size:11px;font-weight:700;color:${G.muted};text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px}
  .field{margin-bottom:14px}
  .field-row{display:grid;gap:14px}

  .tbl thead tr{background:${G.surface}}
  .tbl th{padding:10px 14px;text-align:left;font-size:10px;font-weight:700;color:${G.muted};text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid ${G.border}}
  .tbl td{padding:11px 14px;border-bottom:1px solid ${G.border};color:${G.text};font-size:13px}
  .tbl tr:last-child td{border-bottom:none}
  .tbl tr:hover td{background:${G.surface}}

  .tabs{display:flex;gap:4px;background:${G.surface};border:1px solid ${G.border};border-radius:12px;padding:4px;margin-bottom:20px}
  .tab{flex:1;padding:8px 14px;border:none;border-radius:9px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:${G.muted2};background:transparent;transition:.15s}
  .tab.active{background:${G.accent};color:${G.bg};font-weight:700}

  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
  .modal{background:${G.card};border:1px solid ${G.border2};border-radius:18px;padding:28px;width:100%;max-height:90vh;overflow-y:auto}
  .modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}
  .modal-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:${G.text}}

  .search-box{position:relative;display:flex;align-items:center}
  .search-icon{position:absolute;left:11px;color:${G.muted};pointer-events:none}
  .search-inp{padding:9px 12px 9px 35px;background:${G.surface};border:1.5px solid ${G.border};border-radius:10px;color:${G.text};font-size:13px;outline:none;width:240px;font-family:'DM Sans',sans-serif}
  .search-inp:focus{border-color:${G.accent}}

  .progress-bar{background:${G.border};border-radius:999px;height:6px;overflow:hidden}
  .progress-fill{height:6px;border-radius:999px;transition:width .5s}

  .avatar{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0}

  .empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:${G.muted};text-align:center}
  .empty-icon{font-size:40px;margin-bottom:12px;opacity:.4}
  .empty-text{font-size:14px}

  .section-sep{height:1px;background:${G.border};margin:20px 0}

  .meal-block{background:${G.surface};border:1px solid ${G.border};border-radius:12px;padding:14px;margin-bottom:10px}
  .meal-time{font-size:11px;color:${G.accent};font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px}
  .meal-name{font-size:14px;font-weight:600;color:${G.text};margin-bottom:10px}
  .food-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid ${G.border};font-size:12px}
  .food-row:last-child{border-bottom:none}
  .food-name{color:${G.text}}
  .food-info{color:${G.muted2};display:flex;gap:14px}
  .food-cals{color:${G.accent};font-weight:600}

  .ex-block{background:${G.surface};border:1px solid ${G.border};border-radius:12px;padding:14px;margin-bottom:8px}
  .ex-day{font-size:10px;color:${G.accent2};font-weight:700;text-transform:uppercase;letter-spacing:.8px}
  .ex-name{font-size:14px;font-weight:600;color:${G.text};margin:4px 0}
  .ex-info{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px}
  .ex-tag{background:${G.border};color:${G.muted2};padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600}
  .ex-tag.sets{color:${G.accent};background:#1a2a0a}
  .ex-tag.reps{color:${G.accent2};background:#0a1a2a}
  .ex-tag.rest{color:${G.muted2}}

  .macro-pill{display:flex;flex-direction:column;align-items:center;background:${G.surface};border:1px solid ${G.border};border-radius:12px;padding:12px 16px;flex:1}
  .macro-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:${G.text}}
  .macro-label{font-size:10px;color:${G.muted};text-transform:uppercase;letter-spacing:.8px;margin-top:2px}

  .progress-entry{background:${G.surface};border:1px solid ${G.border};border-radius:12px;padding:14px;display:grid;grid-template-columns:1fr repeat(4,auto);gap:12px;align-items:center;margin-bottom:8px}
  .progress-date{font-weight:600;color:${G.text};font-size:13px}
  .progress-stat{text-align:center}
  .progress-stat-val{font-family:'Syne',sans-serif;font-weight:700;font-size:16px;color:${G.text}}
  .progress-stat-lbl{font-size:10px;color:${G.muted};text-transform:uppercase}
  .progress-delta-pos{color:#4ade80;font-size:11px;font-weight:700}
  .progress-delta-neg{color:${G.accent3};font-size:11px;font-weight:700}

  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .fade-in{animation:fadeIn .25s ease both}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spinner{width:36px;height:36px;border:3px solid ${G.border};border-top-color:${G.accent};border-radius:50%;animation:spin 1s linear infinite}
`;

// ── SVG ICONS ────────────────────────────────────────────────
const I = ({ n, s=16, c="currentColor" }) => {
  const p = {
    dash:    <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    clients: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    diet:    <><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></>,
    workout: <><path d="M6.5 6.5h11M6.5 17.5h11M4 12h16"/><circle cx="4" cy="6.5" r="2"/><circle cx="20" cy="6.5" r="2"/><circle cx="4" cy="17.5" r="2"/><circle cx="20" cy="17.5" r="2"/></>,
    progress:<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    payments:<><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    close:   <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    edit:    <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash:   <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>,
    search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    alert:   <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    chevron: <><polyline points="9 18 15 12 9 6"/></>,
    check:   <><polyline points="20 6 9 17 4 12"/></>,
    user:    <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    eye:     <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    scale:   <><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{p[n]}</svg>;
};

// ── HELPERS ──────────────────────────────────────────────────
const GOALS     = ["Pérdida de grasa","Ganancia muscular","Tonificación","Rendimiento deportivo","Definición","Mantenimiento","Salud general"];
const ACTIVITY  = ["Sedentario","Ligero (1-2 días/semana)","Moderado (3-4 días/semana)","Activo (5+ días/semana)","Atleta profesional"];
const PLANS     = ["Básico","Pro","Premium","Elite"];
const MUSCLES   = ["Pecho","Espalda","Hombros","Bíceps","Tríceps","Piernas","Glúteos","Abdomen","Cardio","Full Body"];
const DAYS_ES   = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

const avatarColors = [
  ["#c8f026","#07080d"],["#4f8ef7","#07080d"],["#f7714f","#fff"],
  ["#a78bfa","#07080d"],["#34d399","#07080d"],["#fb923c","#07080d"],
];
const Avatar = ({ name, idx=0, size=34 }) => {
  const [bg, fg] = avatarColors[idx % avatarColors.length];
  const initials = name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "??";
  return <div style={{ width:size, height:size, borderRadius:9, background:`linear-gradient(135deg,${bg},${bg}cc)`, color:fg, display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:size*0.35,flexShrink:0,fontFamily:"'Syne',sans-serif" }}>{initials}</div>;
};

const Field = ({ label, span=1, children }) => (
  <div style={{ gridColumn:`span ${span}` }} className="field">
    <label className="lbl">{label}</label>
    {children}
  </div>
);

const bmi = (w, h) => h > 0 ? (w / ((h/100)**2)).toFixed(1) : "—";
const bmr = (w, h, age, sex="m") => sex==="m" ? Math.round(10*w+6.25*h-5*age+5) : Math.round(10*w+6.25*h-5*age-161);

// ── AUTH SCREEN ──────────────────────────────────────────────
function AuthScreen() {
  const [mode,  setMode]  = useState("login");
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [name,  setName]  = useState("");
  const [err,   setErr]   = useState("");
  const [msg,   setMsg]   = useState("");
  const [busy,  setBusy]  = useState(false);

  const go = async () => {
    setErr(""); setMsg(""); setBusy(true);
    try {
      if (mode==="login") {
        await signInWithEmailAndPassword(auth, email, pass);
      } else if (mode==="register") {
        if (!name.trim()) { setErr("Escribe tu nombre"); setBusy(false); return; }
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await addDoc(collection(db,"fitcrm_coaches"),{ uid:cred.user.uid, name, email, createdAt:new Date().toISOString() });
      } else {
        await sendPasswordResetEmail(auth, email);
        setMsg("✅ Revisa tu email para restablecer tu contraseña."); setBusy(false); return;
      }
    } catch(e) {
      const m = { "auth/user-not-found":"No existe cuenta con ese email.","auth/wrong-password":"Contraseña incorrecta.","auth/email-already-in-use":"Ese email ya está registrado.","auth/weak-password":"Mínimo 6 caracteres.","auth/invalid-email":"Email inválido.","auth/invalid-credential":"Email o contraseña incorrectos." };
      setErr(m[e.code] || e.message);
    }
    setBusy(false);
  };

  return (
    <div style={{ minHeight:"100vh",background:G.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif" }}>
      <style>{css}</style>
      <div style={{ width:"100%",maxWidth:420 }}>
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:10,marginBottom:8 }}>
            <div className="sb-logo-mark">F</div>
            <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:G.text }}>FitCRM <span style={{ color:G.accent }}>Pro</span></span>
          </div>
          <div style={{ color:G.muted,fontSize:13 }}>La plataforma profesional para coaches fitness</div>
        </div>
        <div className="card" style={{ border:`1px solid ${G.border2}` }}>
          <div style={{ marginBottom:22 }}>
            <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:G.text,marginBottom:4 }}>
              {mode==="login"?"Iniciar sesión":mode==="register"?"Crear cuenta":"Recuperar contraseña"}
            </div>
            <div style={{ color:G.muted,fontSize:13 }}>
              {mode==="login"?"Bienvenido de vuelta":mode==="register"?"Únete a FitCRM Pro":"Te enviamos un link"}
            </div>
          </div>

          {mode==="register" && (
            <div className="field">
              <label className="lbl">Nombre completo</label>
              <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre"/>
            </div>
          )}
          <div className="field">
            <label className="lbl">Email</label>
            <input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com"/>
          </div>
          {mode!=="reset" && (
            <div className="field">
              <label className="lbl">Contraseña</label>
              <input className="inp" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Mínimo 6 caracteres" onKeyDown={e=>e.key==="Enter"&&go()}/>
            </div>
          )}

          {err && <div style={{ background:"#1a0a0a",border:`1px solid ${G.accent3}40`,borderRadius:10,padding:"10px 14px",color:G.accent3,fontSize:13,marginBottom:14 }}>{err}</div>}
          {msg && <div style={{ background:"#0a1a0a",border:"1px solid #4ade8040",borderRadius:10,padding:"10px 14px",color:"#4ade80",fontSize:13,marginBottom:14 }}>{msg}</div>}

          <button onClick={go} disabled={busy} className="btn btn-primary" style={{ width:"100%",padding:"12px",fontSize:15,justifyContent:"center",marginTop:4,opacity:busy?.7:1 }}>
            {busy?"Cargando...":mode==="login"?"Entrar →":mode==="register"?"Crear cuenta →":"Enviar link"}
          </button>

          <div style={{ marginTop:18,textAlign:"center",fontSize:13,color:G.muted }}>
            {mode==="login" && <>
              <span>¿No tienes cuenta? </span>
              <button onClick={()=>{setMode("register");setErr("");}} style={{ color:G.accent,background:"none",border:"none",cursor:"pointer",fontWeight:600 }}>Regístrate gratis</button>
              <div style={{ marginTop:8 }}>
                <button onClick={()=>{setMode("reset");setErr("");}} style={{ color:G.muted,background:"none",border:"none",cursor:"pointer",fontSize:12 }}>¿Olvidaste tu contraseña?</button>
              </div>
            </>}
            {mode==="register" && <>
              <span>¿Ya tienes cuenta? </span>
              <button onClick={()=>{setMode("login");setErr("");}} style={{ color:G.accent,background:"none",border:"none",cursor:"pointer",fontWeight:600 }}>Iniciar sesión</button>
            </>}
            {mode==="reset" && <button onClick={()=>{setMode("login");setErr("");setMsg("");}} style={{ color:G.accent,background:"none",border:"none",cursor:"pointer",fontWeight:600 }}>← Volver al login</button>}
          </div>
        </div>
        <div style={{ textAlign:"center",marginTop:20,color:G.border2,fontSize:12 }}>FitCRM Pro · Todos los derechos reservados</div>
      </div>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────
function Dashboard({ clients, dietPlans, workoutPlans, progress }) {
  const active   = clients.filter(c=>c.status==="active").length;
  const revenue  = clients.reduce((s,c)=>s+Number(c.revenue||0),0);
  const avgBmi   = clients.filter(c=>c.weight&&c.height).map(c=>parseFloat(bmi(c.weight,c.height))).filter(b=>b>0);
  const avgBmiVal = avgBmi.length ? (avgBmi.reduce((a,b)=>a+b,0)/avgBmi.length).toFixed(1) : "—";

  const goalDist = GOALS.map(g=>({ label:g, count:clients.filter(c=>c.goal===g).length })).filter(g=>g.count>0);
  const maxGoal = Math.max(...goalDist.map(g=>g.count), 1);

  const recentProgress = [...progress].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="page-title">Dashboard</div><div className="page-sub">Visión general de tu negocio</div></div>
      </div>

      <div className="kpi-grid">
        {[
          { label:"Clientes Activos",   value:active,         sub:`${clients.length} total`, icon:"👥", color:G.accent  },
          { label:"Ingresos Mensuales", value:`$${revenue.toLocaleString()}`, sub:"este mes", icon:"💰", color:G.accent2 },
          { label:"Planes de Dieta",    value:dietPlans.length, sub:"personalizados", icon:"🥗", color:"#34d399" },
          { label:"Rutinas Creadas",    value:workoutPlans.length, sub:"activas", icon:"🏋️", color:G.accent3 },
        ].map((k,i)=>(
          <div key={i} className="kpi" style={{ borderTop:`3px solid ${k.color}` }}>
            <div className="kpi-icon">{k.icon}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color:k.color }}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom:16 }}>
        {/* Distribución de objetivos */}
        <div className="card">
          <div className="card-title">Distribución de Objetivos</div>
          {goalDist.length===0
            ? <div className="empty"><div className="empty-icon">🎯</div><div className="empty-text">Sin clientes aún</div></div>
            : goalDist.map((g,i)=>(
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12 }}>
                  <span style={{ color:G.text }}>{g.label}</span>
                  <span style={{ color:G.muted2 }}>{g.count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${(g.count/maxGoal)*100}%`,background:G.accent }}/>
                </div>
              </div>
            ))
          }
        </div>

        {/* Progreso reciente */}
        <div className="card">
          <div className="card-title">Registros de Progreso Recientes</div>
          {recentProgress.length===0
            ? <div className="empty"><div className="empty-icon">📈</div><div className="empty-text">Sin registros aún</div></div>
            : recentProgress.map((p,i)=>{
              const client = clients.find(c=>c.id===p.clientId);
              return (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12,padding:"10px 12px",background:G.surface,borderRadius:10,border:`1px solid ${G.border}` }}>
                  <Avatar name={client?.name||"?"} idx={i}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600,color:G.text,fontSize:13 }}>{client?.name||"Cliente"}</div>
                    <div style={{ fontSize:11,color:G.muted }}>{p.date}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:G.text }}>{p.weight} kg</div>
                    <div style={{ fontSize:11,color:G.muted2 }}>IMC: {bmi(p.weight, client?.height||170)}</div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>

      {/* Tabla resumen clientes */}
      <div className="card">
        <div className="card-title">Clientes Recientes</div>
        {clients.length===0
          ? <div className="empty"><div className="empty-icon">👥</div><div className="empty-text">Sin clientes. ¡Agrega el primero!</div></div>
          : <table className="tbl">
              <thead><tr><th>Cliente</th><th>Objetivo</th><th>Plan</th><th>Peso actual</th><th>IMC</th><th>Estado</th></tr></thead>
              <tbody>
                {clients.slice(0,6).map((c,i)=>(
                  <tr key={c.id}>
                    <td><div style={{ display:"flex",alignItems:"center",gap:10 }}><Avatar name={c.name} idx={i} size={30}/><div><div style={{ fontWeight:600 }}>{c.name}</div><div style={{ fontSize:11,color:G.muted }}>{c.email}</div></div></div></td>
                    <td><span className="badge badge-goal">{c.goal||"—"}</span></td>
                    <td><span className="badge badge-active">{c.plan||"—"}</span></td>
                    <td>{c.weight ? `${c.weight} kg` : "—"}</td>
                    <td style={{ color:G.accent2,fontWeight:600 }}>{c.weight&&c.height ? bmi(c.weight,c.height) : "—"}</td>
                    <td><span className={`badge badge-${c.status||"active"}`}>{c.status==="active"?"Activo":c.status==="pending"?"Pendiente":"Inactivo"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}

// ── CLIENTS ──────────────────────────────────────────────────
function Clients({ clients, onAdd, onUpdate, onDelete }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal,  setModal]  = useState(false);
  const [sel,    setSel]    = useState(null);
  const [busy,   setBusy]   = useState(false);
  const emptyForm = { name:"",email:"",phone:"",age:"",sex:"m",height:"",weight:"",targetWeight:"",bodyFat:"",goal:GOALS[0],activityLevel:ACTIVITY[2],plan:PLANS[1],status:"active",medicalNotes:"",allergies:"",notes:"" };
  const [form, setForm] = useState(emptyForm);
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const filtered = clients.filter(c=>{
    const s = (c.name||"").toLowerCase().includes(search.toLowerCase())||(c.email||"").toLowerCase().includes(search.toLowerCase());
    const f = filter==="all" || c.status===filter;
    return s&&f;
  });

  const openNew  = () => { setForm(emptyForm); setSel(null); setModal(true); };
  const openEdit = (c) => { setForm({...emptyForm,...c}); setSel(c); setModal(true); };

  const save = async () => {
    if (!form.name.trim()) return;
    setBusy(true);
    const data = { ...form, weight:Number(form.weight)||0, targetWeight:Number(form.targetWeight)||0, height:Number(form.height)||0, age:Number(form.age)||0, bodyFat:Number(form.bodyFat)||0, revenue:sel?.revenue||0, joined:sel?.joined||new Date().toISOString().slice(0,10) };
    if (sel) await onUpdate(sel.id, data);
    else await onAdd(data);
    setModal(false); setBusy(false);
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="page-title">Clientes</div><div className="page-sub">{clients.length} registrados · {clients.filter(c=>c.status==="active").length} activos</div></div>
        <button className="btn btn-primary" onClick={openNew}><I n="plus" s={15} c={G.bg}/> Nuevo Cliente</button>
      </div>

      <div style={{ display:"flex",gap:12,marginBottom:18,flexWrap:"wrap" }}>
        <div className="search-box">
          <span className="search-icon"><I n="search" s={14}/></span>
          <input className="search-inp" placeholder="Buscar cliente..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="tabs" style={{ marginBottom:0,width:"auto" }}>
          {[["all","Todos"],["active","Activos"],["pending","Pendientes"],["inactive","Inactivos"]].map(([v,l])=>(
            <button key={v} className={`tab ${filter===v?"active":""}`} onClick={()=>setFilter(v)} style={{ flex:"none",padding:"7px 14px" }}>{l}</button>
          ))}
        </div>
      </div>

      {filtered.length===0
        ? <div className="card"><div className="empty"><div className="empty-icon">👥</div><div className="empty-text">{clients.length===0?"Sin clientes aún. ¡Agrega el primero!":"Sin resultados."}</div></div></div>
        : <div className="card" style={{ padding:0,overflow:"hidden" }}>
            <table className="tbl">
              <thead><tr><th>Cliente</th><th>Edad/Sexo</th><th>Objetivo</th><th>Peso / Meta</th><th>IMC</th><th>Plan</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {filtered.map((c,i)=>(
                  <tr key={c.id}>
                    <td>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <Avatar name={c.name} idx={i}/>
                        <div>
                          <div style={{ fontWeight:600,color:G.text }}>{c.name}</div>
                          <div style={{ fontSize:11,color:G.muted }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color:G.muted2 }}>{c.age ? `${c.age} años` : "—"} · {c.sex==="f"?"♀":"♂"}</td>
                    <td><span className="badge badge-goal" style={{ fontSize:10 }}>{c.goal||"—"}</span></td>
                    <td>
                      <div style={{ fontWeight:600,color:G.text }}>{c.weight||"—"} kg</div>
                      <div style={{ fontSize:11,color:G.muted }}>Meta: {c.targetWeight||"—"} kg</div>
                    </td>
                    <td>
                      <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:G.accent2 }}>{c.weight&&c.height ? bmi(c.weight,c.height) : "—"}</span>
                    </td>
                    <td><span className="badge badge-active">{c.plan||"—"}</span></td>
                    <td><span className={`badge badge-${c.status||"active"}`}>{c.status==="active"?"Activo":c.status==="pending"?"Pendiente":"Inactivo"}</span></td>
                    <td>
                      <div style={{ display:"flex",gap:6 }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={()=>openEdit(c)}><I n="edit" s={13}/></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={()=>onDelete(c.id)}><I n="trash" s={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }

      {modal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal" style={{ maxWidth:640 }}>
            <div className="modal-head">
              <div className="modal-title">{sel?"Editar Cliente":"Nuevo Cliente"}</div>
              <button className="btn btn-secondary btn-icon" onClick={()=>setModal(false)}><I n="close" s={15}/></button>
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
              <Field label="Nombre completo" span={2}><input className="inp" value={form.name} onChange={e=>setF("name",e.target.value)} placeholder="Nombre Apellido"/></Field>
              <Field label="Email"><input className="inp" type="email" value={form.email} onChange={e=>setF("email",e.target.value)} placeholder="email@ejemplo.com"/></Field>
              <Field label="Teléfono"><input className="inp" value={form.phone} onChange={e=>setF("phone",e.target.value)} placeholder="+1 555 0000"/></Field>

              <Field label="Edad"><input className="inp" type="number" value={form.age} onChange={e=>setF("age",e.target.value)} placeholder="30"/></Field>
              <Field label="Sexo">
                <select className="inp" value={form.sex} onChange={e=>setF("sex",e.target.value)}>
                  <option value="m">Masculino</option><option value="f">Femenino</option>
                </select>
              </Field>
              <Field label="Altura (cm)"><input className="inp" type="number" value={form.height} onChange={e=>setF("height",e.target.value)} placeholder="170"/></Field>
              <Field label="Peso actual (kg)"><input className="inp" type="number" value={form.weight} onChange={e=>setF("weight",e.target.value)} placeholder="75"/></Field>
              <Field label="Peso objetivo (kg)"><input className="inp" type="number" value={form.targetWeight} onChange={e=>setF("targetWeight",e.target.value)} placeholder="68"/></Field>
              <Field label="Grasa corporal (%)"><input className="inp" type="number" value={form.bodyFat} onChange={e=>setF("bodyFat",e.target.value)} placeholder="22"/></Field>

              <Field label="Objetivo" span={2}>
                <select className="inp" value={form.goal} onChange={e=>setF("goal",e.target.value)}>
                  {GOALS.map(g=><option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Nivel de actividad" span={2}>
                <select className="inp" value={form.activityLevel} onChange={e=>setF("activityLevel",e.target.value)}>
                  {ACTIVITY.map(a=><option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="Plan">
                <select className="inp" value={form.plan} onChange={e=>setF("plan",e.target.value)}>
                  {PLANS.map(p=><option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Estado">
                <select className="inp" value={form.status} onChange={e=>setF("status",e.target.value)}>
                  <option value="active">Activo</option><option value="pending">Pendiente</option><option value="inactive">Inactivo</option>
                </select>
              </Field>
              <Field label="Alergias / Intolerancias" span={2}><input className="inp" value={form.allergies} onChange={e=>setF("allergies",e.target.value)} placeholder="Ej: lactosa, gluten..."/></Field>
              <Field label="Notas médicas" span={2}><textarea className="inp" rows={2} value={form.medicalNotes} onChange={e=>setF("medicalNotes",e.target.value)} placeholder="Condiciones médicas relevantes..."/></Field>
              <Field label="Notas generales" span={2}><textarea className="inp" rows={2} value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Observaciones del coach..."/></Field>
            </div>

            {form.weight&&form.height&&form.age ? (
              <div style={{ background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:14,marginTop:8,display:"flex",gap:20,flexWrap:"wrap" }}>
                <div><div style={{ fontSize:11,color:G.muted,textTransform:"uppercase",letterSpacing:.6 }}>IMC</div><div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:G.accent }}>{bmi(form.weight,form.height)}</div></div>
                <div><div style={{ fontSize:11,color:G.muted,textTransform:"uppercase",letterSpacing:.6 }}>TMB</div><div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:G.accent2 }}>{bmr(form.weight,form.height,form.age,form.sex)} kcal</div></div>
                <div><div style={{ fontSize:11,color:G.muted,textTransform:"uppercase",letterSpacing:.6 }}>A perder</div><div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:G.accent3 }}>{form.targetWeight ? Math.abs(form.weight-form.targetWeight)+" kg" : "—"}</div></div>
              </div>
            ) : null}

            <div style={{ display:"flex",gap:12,marginTop:20 }}>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex:2,justifyContent:"center" }} onClick={save} disabled={busy}>{busy?"Guardando...":sel?"Guardar Cambios":"Crear Cliente"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DIET PLANS ───────────────────────────────────────────────
function DietPlans({ clients, dietPlans, onAdd, onUpdate, onDelete }) {
  const [selClient, setSelClient] = useState("");
  const [modal,     setModal]     = useState(false);
  const [editPlan,  setEditPlan]  = useState(null);
  const [busy,      setBusy]      = useState(false);

  const emptyMeal = { time:"", name:"", foods:[] };
  const emptyFood = { name:"", portion:"", cals:"", protein:"", carbs:"", fat:"" };
  const emptyPlan = { clientId:"", clientName:"", calories:"", protein:"", carbs:"", fat:"", notes:"", meals:[] };
  const [form, setForm] = useState(emptyPlan);
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const clientPlan = selClient ? dietPlans.filter(p=>p.clientId===selClient) : dietPlans;
  const selectedClient = clients.find(c=>c.id===selClient);

  const openNew = () => {
    setForm({...emptyPlan, clientId:selClient||"", clientName:clients.find(c=>c.id===selClient)?.name||""});
    setEditPlan(null); setModal(true);
  };
  const openEdit = (p) => { setForm({...p}); setEditPlan(p); setModal(true); };

  const addMeal = () => setForm(p=>({...p, meals:[...p.meals,{...emptyMeal,foods:[]}]}));
  const updateMeal = (mi, key, val) => setForm(p=>({ ...p, meals:p.meals.map((m,i)=>i===mi?{...m,[key]:val}:m) }));
  const removeMeal = (mi) => setForm(p=>({...p,meals:p.meals.filter((_,i)=>i!==mi)}));
  const addFood = (mi) => setForm(p=>({ ...p, meals:p.meals.map((m,i)=>i===mi?{...m,foods:[...m.foods,{...emptyFood}]}:m) }));
  const updateFood = (mi,fi,key,val) => setForm(p=>({ ...p, meals:p.meals.map((m,i)=>i===mi?{...m,foods:m.foods.map((f,j)=>j===fi?{...f,[key]:val}:f)}:m) }));
  const removeFood = (mi,fi) => setForm(p=>({ ...p, meals:p.meals.map((m,i)=>i===mi?{...m,foods:m.foods.filter((_,j)=>j!==fi)}:m) }));

  const save = async () => {
    if (!form.clientId||!form.meals.length) return;
    setBusy(true);
    const client = clients.find(c=>c.id===form.clientId);
    const data = { ...form, clientName:client?.name||"", uid:editPlan?.uid };
    if (editPlan) await onUpdate(editPlan.id, data);
    else await onAdd(data);
    setModal(false); setBusy(false);
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="page-title">Planes de Dieta</div><div className="page-sub">Crea y gestiona planes nutricionales personalizados</div></div>
        <div style={{ display:"flex",gap:10 }}>
          <select className="inp" style={{ width:"auto" }} value={selClient} onChange={e=>setSelClient(e.target.value)}>
            <option value="">Todos los clientes</option>
            {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openNew}><I n="plus" s={15} c={G.bg}/> Nuevo Plan</button>
        </div>
      </div>

      {selectedClient && (
        <div className="card" style={{ marginBottom:16,border:`1px solid ${G.accent}30` }}>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <Avatar name={selectedClient.name} size={44}/>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700,fontSize:16,color:G.text }}>{selectedClient.name}</div>
              <div style={{ fontSize:12,color:G.muted,marginTop:2 }}>{selectedClient.goal} · {selectedClient.activityLevel}</div>
            </div>
            <div style={{ display:"flex",gap:12 }}>
              {[
                { l:"Peso", v:`${selectedClient.weight||"—"} kg` },
                { l:"Altura", v:`${selectedClient.height||"—"} cm` },
                { l:"IMC", v:selectedClient.weight&&selectedClient.height?bmi(selectedClient.weight,selectedClient.height):"—" },
                { l:"TMB", v:selectedClient.weight&&selectedClient.height&&selectedClient.age?`${bmr(selectedClient.weight,selectedClient.height,selectedClient.age,selectedClient.sex)} kcal`:"—" },
              ].map((s,i)=>(
                <div key={i} style={{ textAlign:"center",background:G.surface,borderRadius:10,padding:"8px 14px" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:G.accent,fontSize:15 }}>{s.v}</div>
                  <div style={{ fontSize:10,color:G.muted,textTransform:"uppercase" }}>{s.l}</div>
                </div>
              ))}
              {selectedClient.allergies && <div style={{ background:"#2a1a0a",border:`1px solid ${G.accent3}40`,borderRadius:10,padding:"8px 14px",fontSize:11,color:G.accent3 }}>⚠️ {selectedClient.allergies}</div>}
            </div>
          </div>
        </div>
      )}

      {clientPlan.length===0
        ? <div className="card"><div className="empty"><div className="empty-icon">🥗</div><div className="empty-text">Sin planes de dieta. ¡Crea el primero!</div></div></div>
        : clientPlan.map(plan=>{
          const client = clients.find(c=>c.id===plan.clientId);
          return (
            <div key={plan.id} className="card" style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <Avatar name={client?.name||"?"} size={36}/>
                  <div>
                    <div style={{ fontWeight:700,color:G.text,fontSize:15 }}>{client?.name||"Cliente"}</div>
                    <div style={{ fontSize:12,color:G.muted }}>{plan.meals?.length||0} comidas · {plan.calories||"—"} kcal/día</div>
                  </div>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(plan)}><I n="edit" s={13}/> Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>onDelete(plan.id)}><I n="trash" s={13}/></button>
                </div>
              </div>
              <div style={{ display:"flex",gap:10,marginBottom:16 }}>
                {[{l:"Calorías",v:`${plan.calories||0} kcal`,c:G.accent},{l:"Proteína",v:`${plan.protein||0}g`,c:"#4ade80"},{l:"Carbohidratos",v:`${plan.carbs||0}g`,c:G.accent2},{l:"Grasas",v:`${plan.fat||0}g`,c:G.accent3}].map((m,i)=>(
                  <div key={i} className="macro-pill"><div className="macro-val" style={{ color:m.c }}>{m.v}</div><div className="macro-label">{m.l}</div></div>
                ))}
              </div>
              {plan.meals?.map((meal,i)=>(
                <div key={i} className="meal-block">
                  <div className="meal-time">{meal.time}</div>
                  <div className="meal-name">{meal.name}</div>
                  {meal.foods?.map((f,j)=>(
                    <div key={j} className="food-row">
                      <span className="food-name">{f.name}</span>
                      <div className="food-info">
                        <span>{f.portion}</span>
                        {f.protein && <span>P: {f.protein}g</span>}
                        {f.carbs && <span>C: {f.carbs}g</span>}
                        <span className="food-cals">{f.cals} kcal</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {plan.notes && <div style={{ marginTop:10,padding:"10px 14px",background:G.surface,borderRadius:10,fontSize:12,color:G.muted2,fontStyle:"italic" }}>📝 {plan.notes}</div>}
            </div>
          );
        })
      }

      {modal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal" style={{ maxWidth:700 }}>
            <div className="modal-head">
              <div className="modal-title">{editPlan?"Editar Plan de Dieta":"Nuevo Plan de Dieta"}</div>
              <button className="btn btn-secondary btn-icon" onClick={()=>setModal(false)}><I n="close" s={15}/></button>
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16 }}>
              <Field label="Cliente" span={2}>
                <select className="inp" value={form.clientId} onChange={e=>setF("clientId",e.target.value)}>
                  <option value="">Selecciona un cliente</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Calorías/día"><input className="inp" type="number" value={form.calories} onChange={e=>setF("calories",e.target.value)} placeholder="2000"/></Field>
              <Field label="Proteína (g)"><input className="inp" type="number" value={form.protein} onChange={e=>setF("protein",e.target.value)} placeholder="150"/></Field>
              <Field label="Carbohidratos (g)"><input className="inp" type="number" value={form.carbs} onChange={e=>setF("carbs",e.target.value)} placeholder="200"/></Field>
              <Field label="Grasas (g)"><input className="inp" type="number" value={form.fat} onChange={e=>setF("fat",e.target.value)} placeholder="70"/></Field>
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:G.text }}>Comidas del día</div>
                <button className="btn btn-secondary btn-sm" onClick={addMeal}><I n="plus" s={13}/> Agregar comida</button>
              </div>
              {form.meals.map((meal,mi)=>(
                <div key={mi} style={{ background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:14,marginBottom:10 }}>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:10,marginBottom:10 }}>
                    <input className="inp" placeholder="Nombre (ej: Desayuno)" value={meal.name} onChange={e=>updateMeal(mi,"name",e.target.value)}/>
                    <input className="inp" placeholder="Hora (ej: 7:00 AM)" value={meal.time} onChange={e=>updateMeal(mi,"time",e.target.value)}/>
                    <button className="btn btn-danger btn-icon" onClick={()=>removeMeal(mi)}><I n="trash" s={13}/></button>
                  </div>
                  {meal.foods.map((f,fi)=>(
                    <div key={fi} style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr auto",gap:8,marginBottom:6 }}>
                      <input className="inp" placeholder="Alimento" value={f.name} onChange={e=>updateFood(mi,fi,"name",e.target.value)}/>
                      <input className="inp" placeholder="Porción" value={f.portion} onChange={e=>updateFood(mi,fi,"portion",e.target.value)}/>
                      <input className="inp" placeholder="kcal" type="number" value={f.cals} onChange={e=>updateFood(mi,fi,"cals",e.target.value)}/>
                      <input className="inp" placeholder="Prot.g" type="number" value={f.protein} onChange={e=>updateFood(mi,fi,"protein",e.target.value)}/>
                      <input className="inp" placeholder="Carb.g" type="number" value={f.carbs} onChange={e=>updateFood(mi,fi,"carbs",e.target.value)}/>
                      <input className="inp" placeholder="Gras.g" type="number" value={f.fat} onChange={e=>updateFood(mi,fi,"fat",e.target.value)}/>
                      <button className="btn btn-danger btn-icon" onClick={()=>removeFood(mi,fi)}><I n="close" s={13}/></button>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={()=>addFood(mi)} style={{ marginTop:4 }}><I n="plus" s={13}/> Alimento</button>
                </div>
              ))}
            </div>

            <div className="field">
              <label className="lbl">Notas / Indicaciones</label>
              <textarea className="inp" rows={2} value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Indicaciones especiales, suplementos, hidratación..."/>
            </div>

            <div style={{ display:"flex",gap:12,marginTop:16 }}>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex:2,justifyContent:"center" }} onClick={save} disabled={busy}>{busy?"Guardando...":editPlan?"Guardar Cambios":"Crear Plan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── WORKOUT PLANS ────────────────────────────────────────────
function WorkoutPlans({ clients, workoutPlans, onAdd, onUpdate, onDelete }) {
  const [selClient, setSelClient] = useState("");
  const [modal,     setModal]     = useState(false);
  const [editPlan,  setEditPlan]  = useState(null);
  const [busy,      setBusy]      = useState(false);

  const emptyExercise = { name:"", sets:"", reps:"", weight:"", rest:"", notes:"", muscle:"" };
  const emptyDay = { day:"Lunes", exercises:[] };
  const emptyPlan = { clientId:"", clientName:"", goal:"", level:"Intermedio", days:[], generalNotes:"" };
  const [form, setForm] = useState(emptyPlan);
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const clientPlans = selClient ? workoutPlans.filter(p=>p.clientId===selClient) : workoutPlans;

  const openNew = () => { setForm({...emptyPlan,clientId:selClient||""}); setEditPlan(null); setModal(true); };
  const openEdit = (p) => { setForm({...p}); setEditPlan(p); setModal(true); };

  const addDay = () => setForm(p=>({...p,days:[...p.days,{...emptyDay,exercises:[]}]}));
  const updateDay = (di,k,v) => setForm(p=>({...p,days:p.days.map((d,i)=>i===di?{...d,[k]:v}:d)}));
  const removeDay = (di) => setForm(p=>({...p,days:p.days.filter((_,i)=>i!==di)}));
  const addEx = (di) => setForm(p=>({...p,days:p.days.map((d,i)=>i===di?{...d,exercises:[...d.exercises,{...emptyExercise}]}:d)}));
  const updateEx = (di,ei,k,v) => setForm(p=>({...p,days:p.days.map((d,i)=>i===di?{...d,exercises:d.exercises.map((e,j)=>j===ei?{...e,[k]:v}:e)}:d)}));
  const removeEx = (di,ei) => setForm(p=>({...p,days:p.days.map((d,i)=>i===di?{...d,exercises:d.exercises.filter((_,j)=>j!==ei)}:d)}));

  const save = async () => {
    if (!form.clientId||!form.days.length) return;
    setBusy(true);
    const client = clients.find(c=>c.id===form.clientId);
    const data = { ...form, clientName:client?.name||"" };
    if (editPlan) await onUpdate(editPlan.id, data);
    else await onAdd(data);
    setModal(false); setBusy(false);
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="page-title">Rutinas de Ejercicio</div><div className="page-sub">Diseña planes de entrenamiento personalizados</div></div>
        <div style={{ display:"flex",gap:10 }}>
          <select className="inp" style={{ width:"auto" }} value={selClient} onChange={e=>setSelClient(e.target.value)}>
            <option value="">Todos los clientes</option>
            {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openNew}><I n="plus" s={15} c={G.bg}/> Nueva Rutina</button>
        </div>
      </div>

      {clientPlans.length===0
        ? <div className="card"><div className="empty"><div className="empty-icon">🏋️</div><div className="empty-text">Sin rutinas. ¡Crea la primera!</div></div></div>
        : clientPlans.map(plan=>{
          const client = clients.find(c=>c.id===plan.clientId);
          const totalEx = plan.days?.reduce((s,d)=>s+d.exercises.length,0)||0;
          return (
            <div key={plan.id} className="card" style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <Avatar name={client?.name||"?"} size={36}/>
                  <div>
                    <div style={{ fontWeight:700,color:G.text,fontSize:15 }}>{client?.name||"Cliente"}</div>
                    <div style={{ fontSize:12,color:G.muted }}>{plan.days?.length||0} días · {totalEx} ejercicios · {plan.level}</div>
                  </div>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  {plan.goal && <span className="badge badge-goal">{plan.goal}</span>}
                  <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(plan)}><I n="edit" s={13}/> Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>onDelete(plan.id)}><I n="trash" s={13}/></button>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10 }}>
                {plan.days?.map((day,di)=>(
                  <div key={di} className="ex-block">
                    <div className="ex-day">{day.day}</div>
                    {day.exercises.map((ex,ei)=>(
                      <div key={ei} style={{ borderBottom:`1px solid ${G.border}`,paddingBottom:8,marginBottom:8 }}>
                        <div className="ex-name">{ex.name||"Ejercicio"}</div>
                        <div className="ex-info">
                          {ex.sets && <span className="ex-tag sets">{ex.sets} series</span>}
                          {ex.reps && <span className="ex-tag reps">{ex.reps} reps</span>}
                          {ex.weight && <span className="ex-tag">{ex.weight} kg</span>}
                          {ex.rest && <span className="ex-tag rest">⏱ {ex.rest}s</span>}
                          {ex.muscle && <span className="ex-tag">{ex.muscle}</span>}
                        </div>
                        {ex.notes && <div style={{ fontSize:11,color:G.muted,marginTop:4,fontStyle:"italic" }}>{ex.notes}</div>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {plan.generalNotes && <div style={{ marginTop:10,padding:"10px 14px",background:G.surface,borderRadius:10,fontSize:12,color:G.muted2,fontStyle:"italic" }}>📝 {plan.generalNotes}</div>}
            </div>
          );
        })
      }

      {modal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal" style={{ maxWidth:720 }}>
            <div className="modal-head">
              <div className="modal-title">{editPlan?"Editar Rutina":"Nueva Rutina"}</div>
              <button className="btn btn-secondary btn-icon" onClick={()=>setModal(false)}><I n="close" s={15}/></button>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:16 }}>
              <Field label="Cliente" span={3}>
                <select className="inp" value={form.clientId} onChange={e=>setF("clientId",e.target.value)}>
                  <option value="">Selecciona un cliente</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Objetivo de la rutina" span={2}><input className="inp" value={form.goal} onChange={e=>setF("goal",e.target.value)} placeholder="ej: Hipertrofia, Fuerza, Cardio..."/></Field>
              <Field label="Nivel">
                <select className="inp" value={form.level} onChange={e=>setF("level",e.target.value)}>
                  {["Principiante","Intermedio","Avanzado","Atleta"].map(l=><option key={l}>{l}</option>)}
                </select>
              </Field>
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:G.text }}>Días de entrenamiento</div>
                <button className="btn btn-secondary btn-sm" onClick={addDay}><I n="plus" s={13}/> Agregar día</button>
              </div>
              {form.days.map((day,di)=>(
                <div key={di} style={{ background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:14,marginBottom:10 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                    <select className="inp" style={{ width:"auto" }} value={day.day} onChange={e=>updateDay(di,"day",e.target.value)}>
                      {DAYS_ES.map(d=><option key={d}>{d}</option>)}
                    </select>
                    <input className="inp" placeholder="Enfoque (ej: Pecho + Tríceps)" value={day.focus||""} onChange={e=>updateDay(di,"focus",e.target.value)}/>
                    <button className="btn btn-danger btn-icon" onClick={()=>removeDay(di)}><I n="trash" s={13}/></button>
                  </div>
                  {day.exercises.map((ex,ei)=>(
                    <div key={ei} style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1.5fr 1.5fr auto",gap:7,marginBottom:7 }}>
                      <input className="inp" placeholder="Ejercicio" value={ex.name} onChange={e=>updateEx(di,ei,"name",e.target.value)}/>
                      <input className="inp" placeholder="Series" type="number" value={ex.sets} onChange={e=>updateEx(di,ei,"sets",e.target.value)}/>
                      <input className="inp" placeholder="Reps" value={ex.reps} onChange={e=>updateEx(di,ei,"reps",e.target.value)}/>
                      <input className="inp" placeholder="Kg" type="number" value={ex.weight} onChange={e=>updateEx(di,ei,"weight",e.target.value)}/>
                      <input className="inp" placeholder="Descanso s" type="number" value={ex.rest} onChange={e=>updateEx(di,ei,"rest",e.target.value)}/>
                      <select className="inp" value={ex.muscle} onChange={e=>updateEx(di,ei,"muscle",e.target.value)}>
                        <option value="">Músculo</option>
                        {MUSCLES.map(m=><option key={m}>{m}</option>)}
                      </select>
                      <input className="inp" placeholder="Notas" value={ex.notes} onChange={e=>updateEx(di,ei,"notes",e.target.value)}/>
                      <button className="btn btn-danger btn-icon" onClick={()=>removeEx(di,ei)}><I n="close" s={13}/></button>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={()=>addEx(di)} style={{ marginTop:4 }}><I n="plus" s={13}/> Ejercicio</button>
                </div>
              ))}
            </div>

            <div className="field">
              <label className="lbl">Notas generales</label>
              <textarea className="inp" rows={2} value={form.generalNotes} onChange={e=>setF("generalNotes",e.target.value)} placeholder="Calentamiento, indicaciones especiales..."/>
            </div>

            <div style={{ display:"flex",gap:12,marginTop:16 }}>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex:2,justifyContent:"center" }} onClick={save} disabled={busy}>{busy?"Guardando...":editPlan?"Guardar Cambios":"Crear Rutina"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PROGRESS ─────────────────────────────────────────────────
function Progress({ clients, progress, onAdd, onDelete }) {
  const [selClient, setSelClient] = useState("");
  const [modal,     setModal]     = useState(false);
  const [busy,      setBusy]      = useState(false);
  const emptyForm = { clientId:"", date:new Date().toISOString().slice(0,10), weight:"", bodyFat:"", chest:"", waist:"", hips:"", arm:"", thigh:"", notes:"" };
  const [form, setForm] = useState(emptyForm);
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const clientProgress = (selClient ? progress.filter(p=>p.clientId===selClient) : progress).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const selectedClient = clients.find(c=>c.id===selClient);

  const save = async () => {
    if (!form.clientId||!form.date) return;
    setBusy(true);
    const client = clients.find(c=>c.id===form.clientId);
    const data = { ...form, clientName:client?.name||"", weight:Number(form.weight)||0, bodyFat:Number(form.bodyFat)||0 };
    await onAdd(data);
    setForm(emptyForm); setModal(false); setBusy(false);
  };

  const delta = (curr, prev, key) => {
    if (!curr[key]||!prev[key]) return null;
    const d = (Number(curr[key])-Number(prev[key])).toFixed(1);
    return { val:d, pos:Number(d)<0, neg:Number(d)>0 };
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="page-title">Seguimiento de Progreso</div><div className="page-sub">Registra medidas y evolución de tus clientes</div></div>
        <div style={{ display:"flex",gap:10 }}>
          <select className="inp" style={{ width:"auto" }} value={selClient} onChange={e=>setSelClient(e.target.value)}>
            <option value="">Todos los clientes</option>
            {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={()=>{ setForm({...emptyForm,clientId:selClient||""}); setModal(true); }}><I n="plus" s={15} c={G.bg}/> Nuevo Registro</button>
        </div>
      </div>

      {selectedClient && (
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
            <Avatar name={selectedClient.name} size={44}/>
            <div>
              <div style={{ fontWeight:700,color:G.text }}>{selectedClient.name}</div>
              <div style={{ fontSize:12,color:G.muted }}>{selectedClient.goal}</div>
            </div>
            <div style={{ marginLeft:"auto",display:"flex",gap:10 }}>
              <div style={{ background:G.surface,borderRadius:10,padding:"8px 16px",textAlign:"center" }}>
                <div style={{ fontSize:10,color:G.muted,textTransform:"uppercase" }}>Peso Inicial</div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:G.text }}>{selectedClient.weight||"—"} kg</div>
              </div>
              <div style={{ background:G.surface,borderRadius:10,padding:"8px 16px",textAlign:"center" }}>
                <div style={{ fontSize:10,color:G.muted,textTransform:"uppercase" }}>Meta</div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:G.accent }}>{selectedClient.targetWeight||"—"} kg</div>
              </div>
              {clientProgress.length>0 && (
                <div style={{ background:G.surface,borderRadius:10,padding:"8px 16px",textAlign:"center" }}>
                  <div style={{ fontSize:10,color:G.muted,textTransform:"uppercase" }}>Último registro</div>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:G.accent2 }}>{clientProgress[0].weight} kg</div>
                </div>
              )}
              {clientProgress.length>0 && selectedClient.weight && (
                <div style={{ background:G.surface,borderRadius:10,padding:"8px 16px",textAlign:"center" }}>
                  <div style={{ fontSize:10,color:G.muted,textTransform:"uppercase" }}>Cambio total</div>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:Number(clientProgress[0].weight)-selectedClient.weight<0?"#4ade80":G.accent3 }}>
                    {(Number(clientProgress[0].weight)-selectedClient.weight).toFixed(1)} kg
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {clientProgress.length===0
        ? <div className="card"><div className="empty"><div className="empty-icon">📈</div><div className="empty-text">Sin registros de progreso aún.</div></div></div>
        : clientProgress.map((entry,i)=>{
          const next = clientProgress[i+1];
          const client = clients.find(c=>c.id===entry.clientId);
          const weightDelta = next ? delta(entry,next,"weight") : null;
          const fatDelta    = next ? delta(entry,next,"bodyFat") : null;
          return (
            <div key={entry.id} className="card" style={{ marginBottom:10 }}>
              <div style={{ display:"grid",gridTemplateColumns:"auto auto 1fr auto",alignItems:"center",gap:16 }}>
                <div style={{ background:G.surface,borderRadius:10,padding:"10px 16px",textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,color:G.accent,fontSize:20 }}>{entry.weight||"—"}</div>
                  <div style={{ fontSize:10,color:G.muted,textTransform:"uppercase" }}>kg</div>
                  {weightDelta && <div className={weightDelta.pos?"progress-delta-pos":"progress-delta-neg"}>{Number(weightDelta.val)>0?"+":""}{weightDelta.val} kg</div>}
                </div>
                {entry.bodyFat ? <div style={{ background:G.surface,borderRadius:10,padding:"10px 16px",textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,color:G.accent2,fontSize:20 }}>{entry.bodyFat}</div>
                  <div style={{ fontSize:10,color:G.muted,textTransform:"uppercase" }}>% grasa</div>
                  {fatDelta && <div className={fatDelta.pos?"progress-delta-pos":"progress-delta-neg"}>{Number(fatDelta.val)>0?"+":""}{fatDelta.val}%</div>}
                </div> : null}
                <div>
                  {!selClient && <div style={{ fontWeight:600,color:G.text,marginBottom:4 }}>{client?.name||"Cliente"}</div>}
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    {entry.chest  && <span className="ex-tag">Pecho: {entry.chest} cm</span>}
                    {entry.waist  && <span className="ex-tag">Cintura: {entry.waist} cm</span>}
                    {entry.hips   && <span className="ex-tag">Cadera: {entry.hips} cm</span>}
                    {entry.arm    && <span className="ex-tag">Brazo: {entry.arm} cm</span>}
                    {entry.thigh  && <span className="ex-tag">Muslo: {entry.thigh} cm</span>}
                  </div>
                  {entry.notes && <div style={{ fontSize:12,color:G.muted,marginTop:6,fontStyle:"italic" }}>📝 {entry.notes}</div>}
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:12,color:G.muted2 }}>{entry.date}</div>
                  <button className="btn btn-danger btn-sm btn-icon" style={{ marginTop:6 }} onClick={()=>onDelete(entry.id)}><I n="trash" s={13}/></button>
                </div>
              </div>
            </div>
          );
        })
      }

      {modal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal" style={{ maxWidth:520 }}>
            <div className="modal-head">
              <div className="modal-title">Nuevo Registro de Progreso</div>
              <button className="btn btn-secondary btn-icon" onClick={()=>setModal(false)}><I n="close" s={15}/></button>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
              <Field label="Cliente" span={2}>
                <select className="inp" value={form.clientId} onChange={e=>setF("clientId",e.target.value)}>
                  <option value="">Selecciona cliente</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Fecha" span={2}><input className="inp" type="date" value={form.date} onChange={e=>setF("date",e.target.value)}/></Field>
              <Field label="Peso (kg)"><input className="inp" type="number" step="0.1" value={form.weight} onChange={e=>setF("weight",e.target.value)} placeholder="75.5"/></Field>
              <Field label="% Grasa corporal"><input className="inp" type="number" step="0.1" value={form.bodyFat} onChange={e=>setF("bodyFat",e.target.value)} placeholder="22.0"/></Field>
              <Field label="Pecho (cm)"><input className="inp" type="number" value={form.chest} onChange={e=>setF("chest",e.target.value)} placeholder="95"/></Field>
              <Field label="Cintura (cm)"><input className="inp" type="number" value={form.waist} onChange={e=>setF("waist",e.target.value)} placeholder="80"/></Field>
              <Field label="Cadera (cm)"><input className="inp" type="number" value={form.hips} onChange={e=>setF("hips",e.target.value)} placeholder="98"/></Field>
              <Field label="Brazo (cm)"><input className="inp" type="number" value={form.arm} onChange={e=>setF("arm",e.target.value)} placeholder="35"/></Field>
              <Field label="Muslo (cm)" span={2}><input className="inp" type="number" value={form.thigh} onChange={e=>setF("thigh",e.target.value)} placeholder="55"/></Field>
              <Field label="Notas" span={2}><textarea className="inp" rows={2} value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Observaciones del coach..."/></Field>
            </div>
            <div style={{ display:"flex",gap:12,marginTop:16 }}>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex:2,justifyContent:"center" }} onClick={save} disabled={busy}>{busy?"Guardando...":"Guardar Registro"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PAYMENTS ─────────────────────────────────────────────────
function Payments({ clients }) {
  const [tab, setTab] = useState("resumen");
  const totalRevenue = clients.reduce((s,c)=>s+Number(c.revenue||0),0);
  const avgRevenue   = clients.length ? Math.round(totalRevenue/clients.length) : 0;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="page-title">Pagos & Ingresos</div><div className="page-sub">Gestión financiera de tu negocio</div></div>
      </div>
      <div className="tabs">
        {[["resumen","📊 Resumen"],["config","⚙️ Pasarelas"]].map(([v,l])=>(
          <button key={v} className={`tab ${tab===v?"active":""}`} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {tab==="resumen" && (
        <div>
          <div className="kpi-grid" style={{ gridTemplateColumns:"repeat(3,1fr)" }}>
            {[
              { l:"Ingresos Totales", v:`$${totalRevenue.toLocaleString()}`, c:G.accent, icon:"💰" },
              { l:"Clientes Activos", v:clients.filter(c=>c.status==="active").length, c:G.accent2, icon:"👥" },
              { l:"Promedio por Cliente", v:`$${avgRevenue}`, c:"#34d399", icon:"📈" },
            ].map((k,i)=>(
              <div key={i} className="kpi" style={{ borderTop:`3px solid ${k.c}` }}>
                <div className="kpi-icon">{k.icon}</div>
                <div className="kpi-label">{k.l}</div>
                <div className="kpi-value" style={{ color:k.c }}>{k.v}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title">Ingresos por Cliente</div>
            {clients.length===0
              ? <div className="empty"><div className="empty-icon">💳</div><div className="empty-text">Sin clientes aún</div></div>
              : <table className="tbl">
                  <thead><tr><th>Cliente</th><th>Plan</th><th>Estado</th><th>Ingresos</th></tr></thead>
                  <tbody>
                    {clients.filter(c=>c.revenue>0).sort((a,b)=>b.revenue-a.revenue).map((c,i)=>(
                      <tr key={c.id}>
                        <td><div style={{ display:"flex",alignItems:"center",gap:10 }}><Avatar name={c.name} idx={i} size={28}/>{c.name}</div></td>
                        <td><span className="badge badge-active">{c.plan}</span></td>
                        <td><span className={`badge badge-${c.status}`}>{c.status==="active"?"Activo":"Inactivo"}</span></td>
                        <td style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:G.accent,fontSize:16 }}>${Number(c.revenue).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </div>
      )}

      {tab==="config" && (
        <div className="grid-3">
          {[
            { name:"Stripe", icon:"💳", color:G.accent, desc:"Tarjeta de crédito y débito. Disponible en +40 países." },
            { name:"PayPal", icon:"🅿️", color:G.accent2, desc:"Pagos internacionales. Disponible en +200 países." },
            { name:"MercadoPago", icon:"🌎", color:"#4ade80", desc:"Ideal para LATAM. México, Colombia, Argentina y más." },
          ].map((g,i)=>(
            <div key={i} className="card" style={{ textAlign:"center" }}>
              <div style={{ fontSize:40,marginBottom:12 }}>{g.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,color:G.text,marginBottom:8 }}>{g.name}</div>
              <div style={{ fontSize:12,color:G.muted,marginBottom:16,lineHeight:1.6 }}>{g.desc}</div>
              <button className="btn btn-primary" style={{ width:"100%",justifyContent:"center" }}>Conectar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SETTINGS ─────────────────────────────────────────────────
function Settings({ coachName, coachEmail, onLogout }) {
  const [name,  setName]  = useState(coachName);
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2000); };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="page-title">Configuración</div><div className="page-sub">Personaliza tu cuenta FitCRM Pro</div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Perfil del Coach</div>
          <div className="field"><label className="lbl">Nombre</label><input className="inp" value={name} onChange={e=>setName(e.target.value)}/></div>
          <div className="field"><label className="lbl">Email</label><input className="inp" value={coachEmail} disabled style={{ opacity:.6 }}/></div>
          <button className="btn btn-primary" onClick={save} style={{ justifyContent:"center",width:"100%" }}>
            {saved ? <><I n="check" s={14} c={G.bg}/> Guardado</> : "Guardar cambios"}
          </button>
        </div>
        <div className="card">
          <div className="card-title">Cuenta</div>
          <div style={{ marginBottom:16,padding:"14px",background:G.surface,borderRadius:12,border:`1px solid ${G.border}` }}>
            <div style={{ fontSize:13,color:G.muted2,marginBottom:4 }}>Plan actual</div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:G.accent,fontSize:18 }}>FitCRM Pro</div>
          </div>
          <button className="btn btn-danger" onClick={onLogout} style={{ width:"100%",justifyContent:"center" }}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [page,         setPage]         = useState("dash");
  const [user,         setUser]         = useState(null);
  const [coachName,    setCoachName]    = useState("Coach");
  const [coachEmail,   setCoachEmail]   = useState("");
  const [authLoading,  setAuthLoading]  = useState(true);
  const [clients,      setClients]      = useState([]);
  const [dietPlans,    setDietPlans]    = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [progress,     setProgress]     = useState([]);

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        setCoachEmail(u.email||"");
        const q = query(collection(db,"fitcrm_coaches"), where("uid","==",u.uid));
        onSnapshot(q, snap => { if (!snap.empty) setCoachName(snap.docs[0].data().name||"Coach"); });
      }
    });
  }, []);

  // Data listeners
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const subs = [
      onSnapshot(query(collection(db,"fitcrm_clients"),    where("uid","==",uid)), s=>setClients(s.docs.map(d=>({id:d.id,...d.data()})))),
      onSnapshot(query(collection(db,"fitcrm_diet"),       where("uid","==",uid)), s=>setDietPlans(s.docs.map(d=>({id:d.id,...d.data()})))),
      onSnapshot(query(collection(db,"fitcrm_workouts"),   where("uid","==",uid)), s=>setWorkoutPlans(s.docs.map(d=>({id:d.id,...d.data()})))),
      onSnapshot(query(collection(db,"fitcrm_progress"),   where("uid","==",uid)), s=>setProgress(s.docs.map(d=>({id:d.id,...d.data()})))),
    ];
    return () => subs.forEach(u=>u());
  }, [user]);

  // CRUD helpers
  const addClient    = d => addDoc(collection(db,"fitcrm_clients"),    {...d, uid:user.uid});
  const updClient    = (id,d) => updateDoc(doc(db,"fitcrm_clients",id),   d);
  const delClient    = id => { if(window.confirm("¿Eliminar cliente?")) deleteDoc(doc(db,"fitcrm_clients",id)); };

  const addDiet      = d => addDoc(collection(db,"fitcrm_diet"),        {...d, uid:user.uid});
  const updDiet      = (id,d) => updateDoc(doc(db,"fitcrm_diet",id),       d);
  const delDiet      = id => deleteDoc(doc(db,"fitcrm_diet",id));

  const addWorkout   = d => addDoc(collection(db,"fitcrm_workouts"),    {...d, uid:user.uid});
  const updWorkout   = (id,d) => updateDoc(doc(db,"fitcrm_workouts",id),   d);
  const delWorkout   = id => deleteDoc(doc(db,"fitcrm_workouts",id));

  const addProgress  = d => addDoc(collection(db,"fitcrm_progress"),    {...d, uid:user.uid});
  const delProgress  = id => deleteDoc(doc(db,"fitcrm_progress",id));

  const logout = () => { signOut(auth); setPage("dash"); };

  const nav = [
    { id:"dash",     icon:"dash",     label:"Dashboard" },
    { id:"clients",  icon:"clients",  label:"Clientes",       badge: clients.filter(c=>c.status==="pending").length||null },
    { id:"diet",     icon:"diet",     label:"Planes de Dieta" },
    { id:"workout",  icon:"workout",  label:"Rutinas" },
    { id:"progress", icon:"progress", label:"Progreso" },
    { id:"payments", icon:"payments", label:"Pagos" },
    { id:"settings", icon:"settings", label:"Configuración" },
  ];

  if (authLoading) return (
    <div style={{ minHeight:"100vh",background:G.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"'DM Sans',sans-serif" }}>
      <style>{css}</style>
      <div className="spinner"/>
      <div style={{ color:G.muted,fontSize:13 }}>Cargando FitCRM Pro...</div>
    </div>
  );

  if (!user) return <AuthScreen/>;

  return (
    <div className="layout">
      <style>{css}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="sb-logo-mark">F</div>
          <div>
            <div className="sb-logo-text">FitCRM <span style={{ color:G.accent }}>Pro</span></div>
            <div className="sb-logo-sub">Coach Platform</div>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section">Principal</div>
          {nav.slice(0,2).map(item=>(
            <div key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>setPage(item.id)}>
              <I n={item.icon} s={16} c={page===item.id?G.bg:G.muted2}/>
              {item.label}
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </div>
          ))}

          <div className="sb-section">Planes</div>
          {nav.slice(2,4).map(item=>(
            <div key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>setPage(item.id)}>
              <I n={item.icon} s={16} c={page===item.id?G.bg:G.muted2}/>
              {item.label}
            </div>
          ))}

          <div className="sb-section">Análisis</div>
          {nav.slice(4,6).map(item=>(
            <div key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>setPage(item.id)}>
              <I n={item.icon} s={16} c={page===item.id?G.bg:G.muted2}/>
              {item.label}
            </div>
          ))}

          <div className="sb-section">Sistema</div>
          {nav.slice(6).map(item=>(
            <div key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>setPage(item.id)}>
              <I n={item.icon} s={16} c={page===item.id?G.bg:G.muted2}/>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="sb-footer">
          <div className="coach-card">
            <div className="coach-av">{coachName.slice(0,2).toUpperCase()}</div>
            <div style={{ flex:1,overflow:"hidden" }}>
              <div className="coach-name" style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{coachName}</div>
              <div className="coach-role">FitCRM Pro</div>
            </div>
            <button className="logout-btn" onClick={logout} title="Cerrar sesión">⏻</button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        {page==="dash"     && <Dashboard     clients={clients} dietPlans={dietPlans} workoutPlans={workoutPlans} progress={progress}/>}
        {page==="clients"  && <Clients       clients={clients} onAdd={addClient} onUpdate={updClient} onDelete={delClient}/>}
        {page==="diet"     && <DietPlans     clients={clients} dietPlans={dietPlans} onAdd={addDiet} onUpdate={updDiet} onDelete={delDiet}/>}
        {page==="workout"  && <WorkoutPlans  clients={clients} workoutPlans={workoutPlans} onAdd={addWorkout} onUpdate={updWorkout} onDelete={delWorkout}/>}
        {page==="progress" && <Progress      clients={clients} progress={progress} onAdd={addProgress} onDelete={delProgress}/>}
        {page==="payments" && <Payments      clients={clients}/>}
        {page==="settings" && <Settings      coachName={coachName} coachEmail={coachEmail} onLogout={logout}/>}
      </main>
    </div>
  );
}
