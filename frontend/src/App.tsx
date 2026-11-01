import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api, LinkStats, ShortLink, shortUrlFor } from "./api";

type IconName =
  | "grid"
  | "link"
  | "chart"
  | "settings"
  | "plus"
  | "search"
  | "copy"
  | "external"
  | "trash"
  | "arrow"
  | "globe"
  | "clock"
  | "check"
  | "close"
  | "spark"
  | "logout"
  | "chevron";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.71-1.71" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    copy: <><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    external: <><path d="M14 3h7v7" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
    trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5M14 11v5" /></>,
    arrow: <><path d="M7 17 17 7" /><path d="M7 7h10v10" /></>,
    globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14Z" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
    chevron: <><path d="m9 18 6-6-6-6" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

type AuthMode = "login" | "register";
type DashboardTab = "overview" | "links" | "analytics";

const TOKEN_KEY = "snip_access_token";
const USER_KEY = "snip_username";

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [username, setUsername] = useState(() => localStorage.getItem(USER_KEY) ?? "");
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [tab, setTab] = useState<DashboardTab>("overview");
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [search, setSearch] = useState("");
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");
  const [selectedStats, setSelectedStats] = useState<LinkStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const loadLinks = useCallback(async () => {
    if (!token) {
      setLinks([]);
      return;
    }
    setLoadingLinks(true);
    setError("");
    try {
      setLinks(await api.links(token));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your links.");
    } finally {
      setLoadingLinks(false);
    }
  }, [token]);

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const totalClicks = useMemo(() => links.reduce((total, link) => total + (link.clickCount || 0), 0), [links]);
  const averageClicks = links.length ? Math.round(totalClicks / links.length) : 0;
  const filteredLinks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const ordered = [...links].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
    return query
      ? ordered.filter((link) => `${link.longUrl} ${link.shortCode}`.toLowerCase().includes(query))
      : ordered;
  }, [links, search]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!token) {
      setAuthMode("login");
      return;
    }
    setCreating(true);
    try {
      const result = await api.create(token, url.trim(), alias.trim(), expiresAt);
      setUrl("");
      setAlias("");
      setExpiresAt("");
      setShowOptions(false);
      await loadLinks();
      try {
        await navigator.clipboard.writeText(shortUrlFor(result.shortCode));
        setCopiedCode(result.shortCode);
        setNotice("Your short link is ready and copied to clipboard.");
      } catch {
        setNotice(`Your short link is ready: ${shortUrlFor(result.shortCode)}`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create this short link.");
    } finally {
      setCreating(false);
    }
  }

  async function copyLink(code: string) {
    try {
      await navigator.clipboard.writeText(shortUrlFor(code));
      setCopiedCode(code);
      setNotice("Short link copied to clipboard.");
    } catch {
      setError("Clipboard access was denied. Select and copy the link manually.");
    }
  }

  async function showStats(link: ShortLink) {
    setStatsLoading(true);
    setSelectedStats({ shortCode: link.shortCode, clickCount: link.clickCount });
    try {
      setSelectedStats(await api.stats(link.shortCode));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load link stats.");
    } finally {
      setStatsLoading(false);
    }
  }

  async function deleteLink(link: ShortLink) {
    if (!window.confirm(`Delete the short link ${link.shortCode}? This cannot be undone.`)) return;
    setError("");
    try {
      await api.remove(token, link.shortCode);
      setLinks((current) => current.filter((item) => item.shortCode !== link.shortCode));
      setNotice("Link deleted.");
      if (selectedStats?.shortCode === link.shortCode) setSelectedStats(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this link.");
    }
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUsername("");
    setLinks([]);
    setNotice("You have been signed out.");
  }

  function onAuthenticated(nextToken: string, nextUsername: string) {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, nextUsername);
    setToken(nextToken);
    setUsername(nextUsername);
    setAuthMode(null);
    setNotice(`Welcome${nextUsername ? `, ${nextUsername}` : ""}!`);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Snip home">
          <span className="brand-mark"><Icon name="link" size={19} /></span>
          <span>snip<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          <button className={`nav-item ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}><Icon name="grid" /> Overview</button>
          <button className={`nav-item ${tab === "links" ? "active" : ""}`} onClick={() => setTab("links")}><Icon name="link" /> My links <span className="nav-count">{links.length}</span></button>
          <button className={`nav-item ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}><Icon name="chart" /> Analytics</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="plan-card">
            <div className="plan-icon"><Icon name="spark" size={17} /></div>
            <strong>Simple links. Big impact.</strong>
            <p>Every great destination starts with one click.</p>
            <div className="plan-meter"><span /></div>
            <small>{token ? `${links.length} links created` : "Free link workspace"}</small>
          </div>
          <button className="nav-item settings-item" onClick={() => token ? signOut() : setAuthMode("login")}>
            <Icon name={token ? "logout" : "settings"} /> {token ? "Sign out" : "Sign in"}
          </button>
          <div className="account-row">
            <div className="avatar">{username ? username.slice(0, 1).toUpperCase() : "G"}</div>
            <div className="account-copy"><strong>{username || "Guest workspace"}</strong><span>{token ? "Personal account" : "Sign in to sync links"}</span></div>
            <button className="icon-button account-action" aria-label={token ? "Sign out" : "Sign in"} onClick={token ? signOut : () => setAuthMode("login")}><Icon name={token ? "logout" : "chevron"} size={16} /></button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{tab === "overview" ? "Overview" : tab === "links" ? "My links" : "Analytics"}</strong></div>
          <div className="topbar-actions">
            <span className="status-pill"><span className="status-dot" /> All systems operational</span>
            {!token && <button className="button button-outline top-signin" onClick={() => setAuthMode("login")}>Sign in</button>}
          </div>
        </header>

        <div className="page-wrap">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">{tab === "analytics" ? "YOUR PERFORMANCE" : "YOUR LINK WORKSPACE"}</p>
              <h1>{tab === "analytics" ? "Analytics" : tab === "links" ? "Your links" : `Good ${timeOfDay()}${username ? `, ${username}` : ""} 👋`}</h1>
              <p className="welcome-subtitle">{tab === "analytics" ? "A clear view of how your short links are performing." : tab === "links" ? "Keep every destination organized and one click away." : "Make your long links short, memorable, and ready to share."}</p>
            </div>
            <button className="button button-refresh" onClick={() => void loadLinks()} disabled={!token || loadingLinks}>
              <span className={loadingLinks ? "spin" : ""}><Icon name="clock" size={16} /></span> Refresh data
            </button>
          </section>

          {error && <div className="error-banner" role="alert"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><Icon name="close" size={16} /></button></div>}

          {tab !== "analytics" && (
            <section className="create-card">
              <div className="create-card-head">
                <div className="create-icon"><Icon name="spark" size={20} /></div>
                <div><h2>Shorten a link</h2><p>Paste a long URL and get a link that’s easy to share.</p></div>
                <span className="secure-label"><Icon name="globe" size={14} /> Fast &amp; reliable</span>
              </div>
              <form className="create-form" onSubmit={(event) => void handleCreate(event)}>
                <label className="url-input-wrap">
                  <Icon name="link" size={18} />
                  <input type="url" required placeholder="https://example.com/your/very/long/link" value={url} onChange={(event) => setUrl(event.target.value)} />
                </label>
                <button className="button button-primary create-button" disabled={creating}>{creating ? <span className="spinner" /> : <Icon name="plus" size={17} />}{creating ? "Creating…" : "Create short link"}</button>
              </form>
              <div className="create-footer">
                <button className="text-button" type="button" onClick={() => setShowOptions((shown) => !shown)}><Icon name="settings" size={15} /> Customize link <span className={`option-chevron ${showOptions ? "open" : ""}`}><Icon name="chevron" size={14} /></span></button>
                {!token && <span className="auth-hint">Sign in to save and manage your links</span>}
              </div>
              {showOptions && <div className="advanced-fields">
                <label><span>Custom short code <small>Optional</small></span><div className="field-with-prefix"><input value={alias} onChange={(event) => setAlias(event.target.value.replace(/\s/g, ""))} maxLength={32} placeholder="your-name" /></div></label>
                <label><span>Link expiration <small>Optional</small></span><input className="date-input" type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label>
              </div>}
            </section>
          )}

          {tab === "analytics" ? (
            <AnalyticsView links={links} totalClicks={totalClicks} averageClicks={averageClicks} onSelect={showStats} onLogin={() => setAuthMode("login")} signedIn={Boolean(token)} />
          ) : (
            <>
              <section className="stats-grid" aria-label="Link performance summary">
                <StatCard label="Total clicks" value={token ? totalClicks.toLocaleString() : "—"} detail={token ? "Across all your links" : "Sign in to see your stats"} icon="chart" tone="blue" />
                <StatCard label="Links created" value={token ? links.length.toLocaleString() : "—"} detail={token ? "In your workspace" : "Your links, all in one place"} icon="link" tone="violet" />
                <StatCard label="Avg. clicks / link" value={token ? averageClicks.toLocaleString() : "—"} detail={token && links.length ? "Lifetime average" : "Performance at a glance"} icon="arrow" tone="mint" />
              </section>

              <section className="links-section">
                <div className="section-heading">
                  <div><h2>{tab === "links" ? "All links" : "Recent links"}</h2><p>{token ? `${links.length} ${links.length === 1 ? "link" : "links"} in your workspace` : "Sign in to see and manage your links"}</p></div>
                  {token && <label className="search-box"><Icon name="search" size={17} /><input placeholder="Search links..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label>}
                </div>
                <div className="table-card">
                  {!token ? (
                    <div className="empty-state">
                      <div className="empty-illustration"><div className="empty-orbit orbit-one" /><div className="empty-orbit orbit-two" /><span><Icon name="link" size={25} /></span></div>
                      <h3>Your links live here</h3><p>Create a free account to save short links, track clicks, and keep everything organized.</p>
                      <button className="button button-primary" onClick={() => setAuthMode("register")}>Create your free account <Icon name="arrow" size={16} /></button>
                    </div>
                  ) : loadingLinks ? (
                    <div className="loading-state"><span className="spinner spinner-dark" /> Loading your links…</div>
                  ) : filteredLinks.length === 0 ? (
                    <div className="empty-state compact-empty"><div className="empty-illustration small"><span><Icon name={search ? "search" : "link"} size={22} /></span></div><h3>{search ? "No links found" : "Nothing here just yet"}</h3><p>{search ? "Try another search term." : "Create your first short link above and it’ll show up here."}</p></div>
                  ) : (
                    <>
                      <div className="table-header"><span>LINK</span><span>CLICKS</span><span>CREATED</span><span> </span></div>
                      <div className="link-rows">{filteredLinks.map((link) => <LinkRow key={link.shortCode} link={link} copied={copiedCode === link.shortCode} onCopy={() => void copyLink(link.shortCode)} onStats={() => void showStats(link)} onDelete={() => void deleteLink(link)} />)}</div>
                    </>
                  )}
                </div>
              </section>
              <div className="bottom-note"><Icon name="spark" size={15} /><span>Short links, long-lasting impressions.</span><span className="note-divider">·</span><span>Built for sharing</span></div>
            </>
          )}
        </div>
      </main>

      {selectedStats && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedStats(null); }}><section className="stats-modal" role="dialog" aria-modal="true" aria-labelledby="stats-title"><button className="modal-close icon-button" onClick={() => setSelectedStats(null)} aria-label="Close stats"><Icon name="close" /></button><div className="modal-icon"><Icon name="chart" size={21} /></div><p className="eyebrow">LINK ANALYTICS</p><h2 id="stats-title">Link performance</h2><p className="modal-url">{shortUrlFor(selectedStats.shortCode)}</p><div className="clicks-highlight"><span>{statsLoading ? "…" : selectedStats.clickCount.toLocaleString()}</span><small>Total clicks</small></div><div className="modal-tip"><Icon name="spark" size={16} /> Share your link to start growing its reach.</div></section></div>}
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onModeChange={setAuthMode} onAuthenticated={onAuthenticated} />}
      {notice && <div className="toast" role="status"><span className="toast-check"><Icon name="check" size={15} /></span>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification"><Icon name="close" size={15} /></button></div>}
    </div>
  );
}

function StatCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: IconName; tone: string }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon name={icon} size={18} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div><div className={`stat-decoration ${tone}`}><span /><span /><span /><span /><span /><span /><span /></div></article>;
}

function LinkRow({ link, copied, onCopy, onStats, onDelete }: { link: ShortLink; copied: boolean; onCopy: () => void; onStats: () => void; onDelete: () => void }) {
  const shortUrl = shortUrlFor(link.shortCode);
  return <article className="link-row">
    <div className="link-main"><div className="favicon">{hostname(link.longUrl).slice(0, 1).toUpperCase()}</div><div className="link-copy"><div className="short-link">{shortUrl}<button className={`copy-button ${copied ? "copied" : ""}`} onClick={onCopy} aria-label="Copy short link"><Icon name={copied ? "check" : "copy"} size={14} /></button></div><div className="destination"><span>{hostname(link.longUrl)}</span><span className="destination-path">{link.longUrl.replace(/^https?:\/\/[^/]+/, "") || "/"}</span></div></div></div>
    <div className="click-count"><strong>{(link.clickCount || 0).toLocaleString()}</strong><span>clicks</span></div>
    <div className="created-date"><span className="date-dot" /> Active</div>
    <div className="row-actions"><button className="icon-button" onClick={onStats} aria-label={`View stats for ${link.shortCode}`} title="View analytics"><Icon name="chart" size={16} /></button><a className="icon-button" href={link.longUrl} target="_blank" rel="noreferrer" aria-label="Open destination" title="Open destination"><Icon name="external" size={16} /></a><button className="icon-button danger-action" onClick={onDelete} aria-label={`Delete ${link.shortCode}`} title="Delete link"><Icon name="trash" size={16} /></button></div>
  </article>;
}

function AnalyticsView({ links, totalClicks, averageClicks, onSelect, onLogin, signedIn }: { links: ShortLink[]; totalClicks: number; averageClicks: number; onSelect: (link: ShortLink) => void; onLogin: () => void; signedIn: boolean }) {
  const topLinks = [...links].sort((a, b) => b.clickCount - a.clickCount).slice(0, 5);
  return <section className="analytics-view">
    <div className="stats-grid analytics-cards"><StatCard label="Total clicks" value={signedIn ? totalClicks.toLocaleString() : "—"} detail="Across all your links" icon="chart" tone="blue" /><StatCard label="Active links" value={signedIn ? links.length.toLocaleString() : "—"} detail="Links in your workspace" icon="link" tone="violet" /><StatCard label="Avg. clicks / link" value={signedIn ? averageClicks.toLocaleString() : "—"} detail="Lifetime average" icon="arrow" tone="mint" /></div>
    <div className="analytics-panel"><div className="section-heading"><div><h2>Top performing links</h2><p>Your links ranked by total clicks</p></div><span className="live-tag"><span className="status-dot" /> LIVE DATA</span></div>
      {!signedIn ? <div className="analytics-empty"><p>Sign in to see how your links are performing.</p><button className="button button-primary" onClick={onLogin}>Sign in to view analytics</button></div> : topLinks.length ? <div className="top-links">{topLinks.map((link, index) => <button className="top-link-row" key={link.shortCode} onClick={() => onSelect(link)}><span className={`rank rank-${index + 1}`}>{String(index + 1).padStart(2, "0")}</span><span className="top-link-info"><strong>{shortUrlFor(link.shortCode)}</strong><small>{hostname(link.longUrl)}</small></span><span className="top-clicks">{link.clickCount.toLocaleString()} <small>clicks</small></span><Icon name="chevron" size={17} /></button>)}</div> : <div className="analytics-empty"><p>Create your first short link to start tracking clicks.</p></div>}
    </div>
    <div className="analytics-footnote"><Icon name="clock" size={15} /><span>Click totals update when you refresh. Detailed time-series analytics are not available yet.</span></div>
  </section>;
}

function AuthModal({ mode, onClose, onModeChange, onAuthenticated }: { mode: AuthMode; onClose: () => void; onModeChange: (mode: AuthMode) => void; onAuthenticated: (token: string, username: string) => void }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "register") await api.register(username.trim(), email.trim(), password);
      const result = await api.login(username.trim(), password);
      onAuthenticated(result.token, username.trim());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return <div className="modal-backdrop auth-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
    <button className="modal-close icon-button" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
    <div className="brand auth-brand"><span className="brand-mark"><Icon name="link" size={18} /></span><span>snip<span className="brand-period">.</span></span></div>
    <div className="auth-intro"><p className="eyebrow">{mode === "login" ? "WELCOME BACK" : "GET STARTED FOR FREE"}</p><h2 id="auth-title">{mode === "login" ? "Sign in to Snip" : "Create your account"}</h2><p>{mode === "login" ? "Pick up right where you left off." : "Save your links and see how they perform."}</p></div>
    <form className="auth-form" onSubmit={(event) => void submit(event)}>
      <label>Username<input autoFocus autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Your username" /></label>
      {mode === "register" && <label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>}
      <label>Password<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "register" ? "At least 8 characters" : "Your password"} /></label>
      {error && <div className="auth-error" role="alert">{error}</div>}
      <button className="button button-primary auth-submit" disabled={busy}>{busy ? <span className="spinner" /> : null}{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}<Icon name="arrow" size={16} /></button>
    </form>
    <p className="auth-switch">{mode === "login" ? "New to Snip?" : "Already have an account?"} <button onClick={() => { setError(""); onModeChange(mode === "login" ? "register" : "login"); }}>{mode === "login" ? "Create an account" : "Sign in"}</button></p>
    <div className="auth-foot"><Icon name="globe" size={14} /> Your links are private to your account</div>
  </section></div>;
}

function timeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export default App;
