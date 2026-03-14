"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const Icon = ({ d, size = 18, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p: string, i: number) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  dashboard: ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  users: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  projects: ["M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"],
  proposals: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8", "M10 9H8"],
  disputes: ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"],
  finance: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  settings: ["M12 20.25c4.556 0 8.25-3.694 8.25-8.25S16.556 3.75 12 3.75 3.75 7.444 3.75 12s3.694 8.25 8.25 8.25z","M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  search: ["M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z", "M16 16l3.5 3.5"],
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  menu: "M3 12h18M3 6h18M3 18h18",
  category: ["M4 6h16","M4 10h16","M4 14h16","M4 18h16"],
  ai: ["M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z","M12 16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z","M2 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z","M16 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"],
} as Record<string, string | string[]>;

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/admin/dashboard", section: "Main" },
  { id: "users", label: "Users", icon: "users", href: "/admin/users", badge: 3, section: "Manage" },
  { id: "projects", label: "Projects", icon: "projects", href: "/admin/projects", section: "Manage" },
  { id: "proposals", label: "Proposals", icon: "proposals", href: "/admin/proposals", section: "Manage" },
  { id: "disputes", label: "Disputes", icon: "disputes", href: "/admin/disputes", badge: 2, section: "Manage" },
  { id: "finance", label: "Finance", icon: "finance", href: "/admin/finance", section: "Platform" },
  { id: "categories", label: "Categories", icon: "category", href: "/admin/categories", section: "Platform" },
  { id: "ai", label: "AI Features", icon: "ai", href: "/admin/ai", section: "Platform" },
  { id: "settings", label: "Settings", icon: "settings", href: "/admin/settings", section: "Platform" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  // Don't apply admin layout to login/register pages
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/register";
  if (isAuthPage) {
    return <>{children}</>;
  }

  const activeItem = navItems.find(n => pathname.startsWith(n.href));
  const sections = Array.from(new Set(navItems.map(n => n.section)));

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&display=swap');
        .admin-root { background: #f8fafc; font-family: 'Geist', -apple-system, sans-serif; display: flex; min-height: 100vh; }
        .admin-root * { font-family: 'Geist', -apple-system, sans-serif; }
        .admin-root {
          --sw: 252px; --sc: 64px; --hh: 56px;
          --blue: #2563eb; --blue-bg: #eff6ff; --blue-hover: #1d4ed8;
          --text: #111827; --text2: #4b5563; --text3: #9ca3af;
          --border: #e5e7eb; --bg: #f9fafb; --white: #ffffff;
          --shadow: 0 1px 3px rgba(0,0,0,.07),0 1px 2px rgba(0,0,0,.04);
          --shadow-md: 0 4px 12px rgba(0,0,0,.08);
          --r: 8px;
        }
        .admin-root .sb {
          width: var(--sw); min-height: 100vh; background: var(--white);
          border-right: 1px solid var(--border); display: flex; flex-direction: column;
          transition: width .2s cubic-bezier(.4,0,.2,1);
          position: fixed; left: 0; top: 0; bottom: 0; z-index: 40; overflow: hidden;
        }
        .admin-root .sb.col { width: var(--sc); }
        .admin-root .sb-logo {
          height: var(--hh); display: flex; align-items: center;
          padding: 0 16px; border-bottom: 1px solid var(--border); gap: 10px; flex-shrink: 0;
        }
        .admin-root .logo-mark {
          width: 30px; height: 30px; border-radius: 7px; background: var(--blue); color: white;
          font-size: 14px; font-weight: 800; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
        }
        .admin-root .logo-txt { font-size: 15px; font-weight: 700; color: var(--text); white-space: nowrap; transition: opacity .15s; }
        .admin-root .col .logo-txt { opacity: 0; pointer-events: none; }
        .admin-root .sb-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 8px 0; }
        .admin-root .sb-nav::-webkit-scrollbar { width: 0; }
        .admin-root .sec-label {
          font-size: 10.5px; font-weight: 600; color: var(--text3);
          letter-spacing: .08em; text-transform: uppercase; padding: 10px 16px 4px;
          white-space: nowrap; transition: opacity .15s;
        }
        .admin-root .col .sec-label { opacity: 0; }
        .admin-root .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px; margin: 1px 8px; border-radius: var(--r); cursor: pointer;
          color: var(--text2); font-size: 13.5px; font-weight: 500;
          transition: all .14s; position: relative; white-space: nowrap;
          text-decoration: none;
        }
        .admin-root .nav-item:hover { background: var(--bg); color: var(--text); }
        .admin-root .nav-item.act { background: var(--blue-bg); color: var(--blue); font-weight: 600; }
        .admin-root .nav-lbl { transition: opacity .15s; overflow: hidden; }
        .admin-root .col .nav-lbl { opacity: 0; width: 0; }
        .admin-root .nav-badge {
          margin-left: auto; background: #fef2f2; color: #dc2626;
          font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px; transition: opacity .15s;
        }
        .admin-root .col .nav-badge { opacity: 0; }
        .admin-root .sb-foot { border-top: 1px solid var(--border); padding: 10px 8px; }
        .admin-root .sb-user {
          display: flex; align-items: center; gap: 10px;
          padding: 8px; border-radius: var(--r); cursor: pointer; transition: background .14s;
        }
        .admin-root .sb-user:hover { background: var(--bg); }
        .admin-root .av {
          width: 30px; height: 30px; border-radius: 7px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white; font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .admin-root .sb-uinfo { transition: opacity .15s; overflow: hidden; }
        .admin-root .col .sb-uinfo { opacity: 0; width: 0; }
        .admin-root .sb-uname { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; }
        .admin-root .sb-urole { font-size: 11px; color: var(--text3); }
        .admin-root .main {
          margin-left: var(--sw); flex: 1;
          transition: margin-left .2s cubic-bezier(.4,0,.2,1);
          display: flex; flex-direction: column; min-width: 0;
        }
        .admin-root .main.col { margin-left: var(--sc); }
        .admin-root .tb {
          height: var(--hh); background: var(--white); border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; position: sticky; top: 0; z-index: 30;
        }
        .admin-root .tb-l { display: flex; align-items: center; gap: 12px; }
        .admin-root .col-btn {
          width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border);
          background: transparent; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text2); transition: all .14s;
        }
        .admin-root .col-btn:hover { background: var(--bg); }
        .admin-root .bc { font-size: 14px; font-weight: 600; color: var(--text); }
        .admin-root .bc span { color: var(--text3); font-weight: 400; }
        .admin-root .tb-r { display: flex; align-items: center; gap: 8px; }
        .admin-root .srch {
          display: flex; align-items: center; gap: 7px;
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 7px; padding: 6px 11px; width: 210px;
        }
        .admin-root .srch input {
          border: none; background: transparent; font-size: 13px;
          color: var(--text); outline: none; font-family: inherit; width: 100%;
        }
        .admin-root .srch input::placeholder { color: var(--text3); }
        .admin-root .ib {
          width: 32px; height: 32px; border-radius: 7px; border: 1px solid var(--border);
          background: transparent; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text2); transition: all .14s; position: relative;
        }
        .admin-root .ib:hover { background: var(--bg); }
        .admin-root .nd {
          position: absolute; top: 5px; right: 5px; width: 7px; height: 7px;
          border-radius: 50%; background: #ef4444; border: 1.5px solid white;
        }
        .admin-root .content { padding: 24px; flex: 1; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
      `}</style>

      <div className="admin-root">
        {/* SIDEBAR */}
        <aside className={`sb${collapsed ? " col" : ""}`}>
          <div className="sb-logo">
            <div className="logo-mark">L</div>
            <span className="logo-txt">Lancerly Admin</span>
          </div>
          <nav className="sb-nav">
            {sections.map(sec => (
              <div key={sec}>
                <div className="sec-label">{sec}</div>
                {navItems.filter(n => n.section === sec).map(item => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`nav-item${pathname.startsWith(item.href) ? " act" : ""}`}
                    title={collapsed ? item.label : ""}
                  >
                    <Icon d={icons[item.icon as keyof typeof icons]} size={17} />
                    <span className="nav-lbl">{item.label}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <div className="sb-foot">
            <div className="sb-user" onClick={handleLogout}>
              <div className="av">A</div>
              <div className="sb-uinfo">
                <div className="sb-uname">{user?.name || "Admin"}</div>
                <div className="sb-urole">Sign out</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className={`main${collapsed ? " col" : ""}`}>
          <header className="tb">
            <div className="tb-l">
              <button className="col-btn" onClick={() => setCollapsed(c => !c)}>
                <Icon d={icons.menu} size={15} />
              </button>
              <div className="bc">
                <span>Admin / </span>{activeItem?.label || "Dashboard"}
              </div>
            </div>
            <div className="tb-r">
              <div className="srch">
                <Icon d={icons.search[0]} size={13} stroke="#9ca3af" />
                <input
                  placeholder="Search users, projects…"
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                />
              </div>
              <button className="ib">
                <Icon d={icons.bell} size={15} />
                <div className="nd" />
              </button>
            </div>
          </header>
          <div className="content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
