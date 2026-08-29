import type { SVGProps } from "react";

export type IconName =
  | "sun"
  | "heart"
  | "home"
  | "game"
  | "user"
  | "chat"
  | "spark"
  | "leaf"
  | "book"
  | "photo"
  | "chevron"
  | "trophy"
  | "paw"
  | "settings"
  | "help"
  | "info"
  | "cat"
  | "breath"
  | "yarn"
  | "memory"
  | "hug"
  | "coffee"
  | "note"
  | "lock"
  | "share"
  | "calendar"
  | "history"
  | "bell"
  | "star"
  | "plus"
  | "dice"
  | "clock"
  | "close"
  | "check"
  | "moon"
  | "monitor"
  | "volume"
  | "motion"
  | "music"
  | "play"
  | "pause"
  | "search"
  | "trash"
  | "skip-back"
  | "skip-forward"
  | "playlist"
  | "shuffle"
  | "repeat"
  | "queue";

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };

  switch (name) {
    case "sun": return <svg {...common}><circle cx="12" cy="12" r="3.7"/><path d="M12 2.8v2.1M12 19.1v2.1M4 4l1.5 1.5M18.5 18.5 20 20M2.8 12h2.1M19.1 12h2.1M4 20l1.5-1.5M18.5 5.5 20 4"/></svg>;
    case "heart": return <svg {...common}><path d="M12 20s-7.5-4.4-8.9-9.1C2 7.2 4.1 4.6 7.1 4.6c2.1 0 3.7 1.2 4.9 3 1.2-1.8 2.8-3 4.9-3 3 0 5.1 2.6 4 6.3C19.5 15.6 12 20 12 20Z"/></svg>;
    case "home": return <svg {...common}><path d="m4 10.5 8-6.7 8 6.7"/><path d="M6.2 9.2V20h11.6V9.2"/><path d="M10 20v-5h4v5"/></svg>;
    case "game": return <svg {...common}><path d="M7.5 8.3h9c2.5 0 4.5 2 4.5 4.5v2.8c0 2.1-2.5 3.1-3.9 1.5l-1.6-1.8h-7l-1.6 1.8C5.5 18.7 3 17.7 3 15.6v-2.8c0-2.5 2-4.5 4.5-4.5Z"/><path d="M7.4 11.3v3M5.9 12.8h3M15.8 12.1h.1M18 14h.1"/></svg>;
    case "user": return <svg {...common}><circle cx="12" cy="8" r="3.2"/><path d="M5 20c1.2-3.8 3.9-5.7 7-5.7s5.8 1.9 7 5.7"/></svg>;
    case "chat": return <svg {...common}><path d="M4 5.5h16v11H9l-4.5 3v-3H4z"/><path d="M8 9.3h8M8 12.5h5.2"/></svg>;
    case "spark": return <svg {...common}><path d="M12 3.5c.8 3 2.3 4.5 5.3 5.3-3 .8-4.5 2.3-5.3 5.3-.8-3-2.3-4.5-5.3-5.3 3-.8 4.5-2.3 5.3-5.3Z"/><path d="M18.2 14.8c.4 1.5 1.2 2.3 2.7 2.7-1.5.4-2.3 1.2-2.7 2.7-.4-1.5-1.2-2.3-2.7-2.7 1.5-.4 2.3-1.2 2.7-2.7Z"/></svg>;
    case "leaf": return <svg {...common}><path d="M19.5 4.5C12 4.4 6.7 7.8 6.2 13.1c-.3 3.1 1.8 5.4 4.8 5.2 5.2-.3 8.4-5.7 8.5-13.8Z"/><path d="M5 20c2.7-4 6-7.1 10.3-9.3"/></svg>;
    case "book": return <svg {...common}><path d="M4 5.2c3.2-.7 5.9-.1 8 1.4v13c-2.1-1.5-4.8-2.1-8-1.4zM20 5.2c-3.2-.7-5.9-.1-8 1.4v13c2.1-1.5 4.8-2.1 8-1.4z"/></svg>;
    case "photo": return <svg {...common}><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m6.5 16 3.7-3.8 2.7 2.5 1.7-1.8 3 3.1"/></svg>;
    case "chevron": return <svg {...common}><path d="m9 6 6 6-6 6"/></svg>;
    case "trophy": return <svg {...common}><path d="M8 4h8v3.5c0 3-1.5 5.2-4 6.1-2.5-.9-4-3.1-4-6.1z"/><path d="M8 6H5v1.5c0 2 1.2 3.3 3.2 3.6M16 6h3v1.5c0 2-1.2 3.3-3.2 3.6M12 13.7V17M8.5 20h7M9.5 17h5"/></svg>;
    case "paw": return <svg {...common} fill="currentColor" stroke="none"><ellipse cx="12" cy="15.3" rx="5" ry="4"/><ellipse cx="6.3" cy="10" rx="2" ry="2.6"/><ellipse cx="10.2" cy="6.8" rx="2" ry="2.6"/><ellipse cx="14.9" cy="6.8" rx="2" ry="2.6"/><ellipse cx="18" cy="10.2" rx="1.9" ry="2.5"/></svg>;
    case "settings": return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7a7 7 0 0 0-.8-1.8l.9-1.9L15 4l-1.9.9a7 7 0 0 0-2.2 0L9 4 6.9 6.1 7.8 8A7 7 0 0 0 7 9.8l-2 .7v3l2 .7a7 7 0 0 0 .8 1.8l-.9 1.9L9 20l1.9-.9a7 7 0 0 0 2.2 0l1.9.9 2.1-2.1-.9-1.9a7 7 0 0 0 .8-1.8z"/></svg>;
    case "help": return <svg {...common}><circle cx="12" cy="12" r="8"/><path d="M9.8 9.3a2.4 2.4 0 1 1 3.7 2c-1 .7-1.5 1.1-1.5 2.2M12 17h.01"/></svg>;
    case "info": return <svg {...common}><circle cx="12" cy="12" r="8"/><path d="M12 10.5V17M12 7.2h.01"/></svg>;
    case "cat": return <svg {...common}><path d="M7 9.2 5 5l4.5 2.3a8 8 0 0 1 5 0L19 5l-2 4.2c.7 1.2 1 2.5 1 4 0 3.8-2.4 6.3-6 6.3s-6-2.5-6-6.3c0-1.5.3-2.8 1-4Z"/><path d="M9.2 13h.01M14.8 13h.01M10.3 16c1.1.7 2.3.7 3.4 0"/></svg>;
    case "breath": return <svg {...common}><path d="M4 9.5h8.5c2 0 2.9-2.6 1.2-3.7-1.2-.8-2.7-.2-3.1 1"/><path d="M4 13h12.7c2.1 0 3.1 2.7 1.4 4-1.2.8-2.8.2-3.2-1"/></svg>;
    case "yarn": return <svg {...common}><circle cx="11" cy="12" r="6.5"/><path d="M7 9c3.2 0 6.2 2.3 8 5M7.5 15c2.5-2.4 5.1-4.4 8-5.5M13.7 17.7c2.5 1.5 4.4 2.1 6.3 1"/></svg>;
    case "memory": return <svg {...common}><path d="M5 5h14v14H5z"/><path d="M8 8h8M8 11h5M8 15h3"/></svg>;
    case "hug": return <svg {...common}><path d="M8.2 9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM15.8 9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M3.8 20v-3.5c0-3.3 1.8-5.2 4.4-5.2 1.6 0 3 1 3.8 2.3.8-1.3 2.2-2.3 3.8-2.3 2.6 0 4.4 1.9 4.4 5.2V20"/><path d="M8.5 15.5c2.1 1.8 4.9 1.8 7 0"/></svg>;
    case "coffee": return <svg {...common}><path d="M5 8h11v5.5A4.5 4.5 0 0 1 11.5 18h-2A4.5 4.5 0 0 1 5 13.5z"/><path d="M16 10h1.7a2.3 2.3 0 1 1 0 4.6H16M8 4.5c0 1 1 1.3 1 2.3M12 4.5c0 1 1 1.3 1 2.3"/></svg>;
    case "note": return <svg {...common}><path d="M6 4h12v16H6z"/><path d="M9 8h6M9 11h6M9 14h4"/></svg>;
    case "lock": return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"/></svg>;
    case "share": return <svg {...common}><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m7.8 11 8.4-4.8M7.8 13l8.4 4.8"/></svg>;
    case "calendar": return <svg {...common}><rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M8 3.5v4M16 3.5v4M4 9.5h16"/></svg>;
    case "history": return <svg {...common}><path d="M4.8 8.5A8 8 0 1 1 4.4 15"/><path d="M4.8 4.5v4h4"/><path d="M12 8v4l3 2"/></svg>;
    case "bell": return <svg {...common}><path d="M6.5 16.5h11c-1.2-1.3-1.8-3-1.8-5.3 0-2.7-1.6-4.7-3.7-4.7s-3.7 2-3.7 4.7c0 2.3-.6 4-1.8 5.3Z"/><path d="M10 19h4"/></svg>;
    case "star": return <svg {...common}><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg>;
    case "plus": return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case "dice": return <svg {...common}><rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01"/></svg>;
    case "clock": return <svg {...common}><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3.2 2"/></svg>;
    case "close": return <svg {...common}><path d="m7 7 10 10M17 7 7 17"/></svg>;
    case "check": return <svg {...common}><path d="m5.5 12.5 4 4 9-9"/></svg>;
    case "moon": return <svg {...common}><path d="M20 15.2A8.2 8.2 0 0 1 8.8 4a8.2 8.2 0 1 0 11.2 11.2Z"/></svg>;
    case "monitor": return <svg {...common}><rect x="3.5" y="4.5" width="17" height="12" rx="2"/><path d="M9 20h6M12 16.5V20"/></svg>;
    case "volume": return <svg {...common}><path d="M5 10h3l4-3v10l-4-3H5z"/><path d="M15 9.5c1.4 1.4 1.4 3.6 0 5M17.7 7c2.7 2.8 2.7 7.2 0 10"/></svg>;
    case "motion": return <svg {...common}><path d="M4 8h7M2.5 12h10M5 16h6"/><path d="M15 7.5 20 12l-5 4.5"/></svg>;
    case "music": return <svg {...common}><path d="M9 18V6l9-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="15.5" cy="16" r="2.5"/></svg>;
    case "play": return <svg {...common}><path d="m9 6 9 6-9 6Z"/></svg>;
    case "pause": return <svg {...common}><path d="M9 6v12M15 6v12"/></svg>;
    case "search": return <svg {...common}><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4 4"/></svg>;
    case "trash": return <svg {...common}><path d="M5 7h14M9 7V4.5h6V7M7.5 7l.7 12h7.6l.7-12M10 10.5v5M14 10.5v5"/></svg>;
    case "skip-back": return <svg {...common}><path d="M6 6v12M18 7l-8 5 8 5Z"/></svg>;
    case "skip-forward": return <svg {...common}><path d="M18 6v12M6 7l8 5-8 5Z"/></svg>;
    case "playlist": return <svg {...common}><path d="M5 7h9M5 11h9M5 15h6"/><path d="M17 14v5M17 14l3-1v4"/><circle cx="15.4" cy="19" r="1.6"/></svg>;
    case "shuffle": return <svg {...common}><path d="M4 7h2.5c4.5 0 4.5 10 9 10H20"/><path d="m17 14 3 3-3 3"/><path d="M4 17h2.5c1.7 0 2.8-1.5 3.8-3.3M13.5 8.5c.7-.9 1.4-1.5 2-1.5H20"/><path d="m17 4 3 3-3 3"/></svg>;
    case "repeat": return <svg {...common}><path d="M7 7h9l3 3-3 3"/><path d="M17 17H8l-3-3 3-3"/></svg>;
    case "queue": return <svg {...common}><path d="M5 7h10M5 12h10M5 17h7"/><path d="m17 15 3 2-3 2Z"/></svg>;
  }
}
