import clsx from "clsx";

export function RoomObject({ itemKey, className }: { itemKey: string; className?: string }) {
  const common = "h-full w-full";
  switch (itemKey) {
    case "sofa":
      return <svg viewBox="0 0 100 70" className={clsx(common, className)}><path d="M18 31c0-9 7-16 16-16h32c9 0 16 7 16 16v22H18Z" fill="#b98173"/><path d="M11 35c0-5 4-9 9-9h3v27H11Z" fill="#9f6d62"/><path d="M77 26h3c5 0 9 4 9 9v18H77Z" fill="#9f6d62"/><rect x="18" y="48" width="64" height="12" rx="5" fill="#a97367"/><path d="M25 60v6M75 60v6" stroke="#6f5848" strokeWidth="4" strokeLinecap="round"/></svg>;
    case "rug":
      return <svg viewBox="0 0 100 55" className={clsx(common, className)}><ellipse cx="50" cy="27" rx="44" ry="21" fill="#c9b39c"/><path d="M23 27c8-8 18-12 27-12s19 4 27 12c-8 8-18 12-27 12S31 35 23 27Z" fill="none" stroke="#a9937d" strokeWidth="3"/></svg>;
    case "lamp":
      return <svg viewBox="0 0 70 100" className={clsx(common, className)}><path d="M23 29h24l-5-18H28Z" fill="#d5b58f"/><path d="M35 29v48" stroke="#6f6154" strokeWidth="4"/><path d="M24 82h22" stroke="#6f6154" strokeWidth="6" strokeLinecap="round"/></svg>;
    case "shelf":
      return <svg viewBox="0 0 100 70" className={clsx(common, className)}><path d="M10 20h80M10 48h80" stroke="#806754" strokeWidth="7" strokeLinecap="round"/><rect x="18" y="7" width="12" height="13" rx="2" fill="#a8886f"/><rect x="34" y="4" width="9" height="16" rx="2" fill="#8e9c88"/><rect x="62" y="34" width="13" height="14" rx="2" fill="#c98276"/></svg>;
    case "plant":
      return <svg viewBox="0 0 80 100" className={clsx(common, className)}><path d="M25 67h30l-5 26H30Z" fill="#9b7157"/><path d="M40 68V31" stroke="#6f8068" strokeWidth="4"/><path d="M40 48c-16-4-19-15-17-24 11 1 19 8 17 24ZM40 40c13-3 18-12 17-21-10 1-17 7-17 21ZM40 60c15-2 21-10 21-19-11-1-19 5-21 19Z" fill="#8e9c88"/></svg>;
    case "fireplace":
      return <svg viewBox="0 0 100 90" className={clsx(common, className)}><rect x="14" y="18" width="72" height="63" rx="4" fill="#b39a83"/><rect x="28" y="38" width="44" height="43" rx="18" fill="#4f433a"/><path d="M50 70c-11-7-8-18 0-27 8 9 11 20 0 27Z" fill="#cf8d63"/><path d="M8 14h84" stroke="#806b58" strokeWidth="8" strokeLinecap="round"/></svg>;
    case "gramophone":
      return <svg viewBox="0 0 100 90" className={clsx(common, className)}><rect x="18" y="52" width="50" height="26" rx="4" fill="#8b6b51"/><circle cx="43" cy="62" r="13" fill="#3f3a35"/><path d="M64 48c12-11 17-22 12-32-15 2-27 13-31 27Z" fill="#c99f78"/><path d="M62 50 52 60" stroke="#705846" strokeWidth="3"/></svg>;
    case "scratcher":
      return <svg viewBox="0 0 70 100" className={clsx(common, className)}><rect x="12" y="83" width="46" height="9" rx="4" fill="#9e8065"/><rect x="31" y="27" width="8" height="58" rx="4" fill="#b99a78"/><path d="M23 25h24l-5-15H28Z" fill="#8e9c88"/><path d="M31 35h8M31 44h8M31 53h8M31 62h8" stroke="#8c725d" strokeWidth="2"/></svg>;
    case "fish_toy":
      return <svg viewBox="0 0 100 55" className={clsx(common, className)}><path d="M19 27c12-17 36-18 52 0-16 18-40 17-52 0Z" fill="#8ea2a0"/><path d="m72 27 18-13v26Z" fill="#78918e"/><circle cx="35" cy="23" r="2.5" fill="#292724"/></svg>;
    case "yarn":
      return <svg viewBox="0 0 80 80" className={clsx(common, className)}><circle cx="38" cy="39" r="27" fill="#c98276"/><path d="M20 30c18 0 31 9 39 25M17 46c13-13 28-22 43-24M31 15c9 13 14 30 13 50" fill="none" stroke="#e8c9c3" strokeWidth="3"/><path d="M56 60c12 1 17 5 20 12" stroke="#c98276" strokeWidth="4" fill="none" strokeLinecap="round"/></svg>;
    case "tunnel":
      return <svg viewBox="0 0 100 70" className={clsx(common, className)}><path d="M12 57V38C12 20 25 9 43 9h14c18 0 31 11 31 29v19Z" fill="#8e9c88"/><ellipse cx="31" cy="49" rx="13" ry="15" fill="#566352"/><ellipse cx="69" cy="49" rx="13" ry="15" fill="#566352"/></svg>;
    case "box":
      return <svg viewBox="0 0 90 75" className={clsx(common, className)}><path d="M18 30h54v38H18Z" fill="#b89169"/><path d="m18 30 14-13h45L72 30ZM72 30 58 18" fill="#caa77e" stroke="#9d7a57" strokeWidth="2"/><path d="M45 31v37" stroke="#98734f" strokeWidth="2"/></svg>;
    case "hammock":
      return <svg viewBox="0 0 100 80" className={clsx(common, className)}><path d="M15 12v58M85 12v58" stroke="#7c6756" strokeWidth="4"/><path d="M18 35c20 28 44 28 64 0" fill="#d3b69b" stroke="#a9876c" strokeWidth="3"/></svg>;
    case "fountain":
      return <svg viewBox="0 0 90 90" className={clsx(common, className)}><ellipse cx="45" cy="70" rx="32" ry="12" fill="#8fa3a0"/><path d="M45 60V24M45 24c-12 11-12 21 0 29M45 24c12 11 12 21 0 29" fill="none" stroke="#aec4c1" strokeWidth="4" strokeLinecap="round"/><ellipse cx="45" cy="61" rx="21" ry="7" fill="#a6b9b6"/></svg>;
    case "painting":
      return <svg viewBox="0 0 90 70" className={clsx(common, className)}><rect x="8" y="8" width="74" height="54" rx="2" fill="#7d6653"/><rect x="14" y="14" width="62" height="42" fill="#ddd2c3"/><circle cx="32" cy="29" r="8" fill="#d2a684"/><path d="M18 50 39 34l13 10 10-8 10 14Z" fill="#8e9c88"/></svg>;
    case "photo_frame":
      return <svg viewBox="0 0 80 70" className={clsx(common, className)}><rect x="10" y="8" width="60" height="50" rx="2" fill="#957761"/><rect x="16" y="14" width="48" height="38" fill="#ece5da"/><path d="M22 46c8-12 16-17 24-13 7 3 10 8 12 13" fill="#c98276" opacity=".65"/><path d="M31 58v7M49 58v7" stroke="#776251" strokeWidth="3"/></svg>;
    case "candles":
      return <svg viewBox="0 0 80 90" className={clsx(common, className)}><rect x="18" y="42" width="14" height="32" rx="3" fill="#e5d8c6"/><rect x="42" y="31" width="16" height="43" rx="3" fill="#d8c7b1"/><path d="M25 39c-7-8 1-13 1-13 6 7 4 11-1 13ZM50 28c-7-8 1-13 1-13 6 7 4 11-1 13Z" fill="#d39a65"/></svg>;
    case "cushions":
      return <svg viewBox="0 0 100 65" className={clsx(common, className)}><rect x="14" y="18" width="40" height="34" rx="12" fill="#c98276"/><rect x="47" y="13" width="39" height="37" rx="12" fill="#8e9c88"/><path d="M34 18v34M66 13v37" stroke="rgba(255,255,255,.28)" strokeWidth="2"/></svg>;
    case "fairy_lights":
      return <svg viewBox="0 0 120 55" className={clsx(common, className)}><path d="M8 14c25 28 76 28 104 0" fill="none" stroke="#807465" strokeWidth="2"/><g fill="#d7ad78"><circle cx="24" cy="28" r="4"/><circle cx="45" cy="37" r="4"/><circle cx="69" cy="38" r="4"/><circle cx="93" cy="28" r="4"/></g></svg>;
    case "flowers":
      return <svg viewBox="0 0 100 90" className={clsx(common, className)}><path d="M28 81 42 43M52 82 54 40M74 81 64 46" stroke="#77876f" strokeWidth="4"/><g fill="#c98276"><circle cx="40" cy="37" r="9"/><circle cx="54" cy="34" r="8"/><circle cx="66" cy="40" r="9"/></g><g fill="#d7ad86"><circle cx="36" cy="31" r="5"/><circle cx="59" cy="30" r="5"/><circle cx="72" cy="35" r="5"/></g></svg>;
    default:
      return <svg viewBox="0 0 80 80" className={clsx(common, className)}><rect x="14" y="14" width="52" height="52" rx="12" fill="#ded3c7"/><path d="M28 40h24M40 28v24" stroke="#866b56" strokeWidth="3" strokeLinecap="round"/></svg>;
  }
}
