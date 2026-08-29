import { CAT_COLOR_PALETTE, type CatAccessory, type CatColorVariant, type CatFurLength } from "@/lib/content/cats";

export interface CatFigureProps {
  colorVariant: CatColorVariant;
  furLength?: CatFurLength;
  accessory?: CatAccessory | null;
  pose?: "sit" | "sleep" | "curious";
  flip?: boolean;
  animated?: boolean;
  size?: number;
  className?: string;
}

export function CatFigure({ colorVariant, furLength = "short", accessory, pose = "sit", flip = false, animated = true, size = 140, className }: CatFigureProps) {
  const palette = CAT_COLOR_PALETTE[colorVariant];
  const isPatched = colorVariant === "blackwhite" || colorVariant === "tortoiseshell";
  const sleeping = pose === "sleep";
  const curious = pose === "curious";
  const outline = colorVariant === "black" ? "#2f2a27" : "#6e5b4d";

  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }} role="img" aria-label="Ilustracja kota">
      <ellipse cx="80" cy="146" rx={sleeping ? 46 : 38} ry="5" fill="rgba(41,39,36,0.08)" />

      {sleeping ? (
        <g>
          <path d="M34 116c2-26 21-43 48-43 29 0 46 17 47 40 0 16-13 26-35 26H61c-18 0-28-8-27-23Z" fill={palette.base} stroke={outline} strokeOpacity=".14" strokeWidth="1.5" />
          <path d="M111 103c21 2 28 15 20 28-5 8-15 11-26 8" fill="none" stroke={palette.shade} strokeWidth={furLength === "long" ? 15 : 11} strokeLinecap="round" />
          <Head palette={palette} patched={isPatched} sleeping animated={animated} curious={false} outline={outline} yOffset={12} />
        </g>
      ) : (
        <g>
          <path d="M48 139c-9-20-7-43 4-58 8-11 18-17 29-17 17 0 29 10 35 25 6 15 4 36-5 50Z" fill={palette.base} stroke={outline} strokeOpacity=".14" strokeWidth="1.5" />
          <path d="M61 138c-2-18 1-31 7-42M97 138c2-18 0-31-6-42" fill="none" stroke={palette.shade} strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />
          <path d="M61 142c2-8 8-11 14-8 2 1 3 4 3 7M84 141c0-5 2-8 5-9 6-2 11 2 12 10" fill={palette.belly} opacity=".8" />
          <g style={animated ? { transformOrigin: "113px 116px", animation: "tail-sway 3.6s ease-in-out infinite" } : undefined}>
            <path d="M110 124c24 0 36-18 30-34-3-8-9-13-17-15" fill="none" stroke={palette.shade} strokeWidth={furLength === "long" ? 16 : 11} strokeLinecap="round" />
          </g>
          {isPatched && <path d="M55 101c10-19 27-22 42-13 8 5 10 14 5 23-11 9-30 9-47-10Z" fill={palette.shade} opacity=".78" />}
          <Head palette={palette} patched={isPatched} sleeping={false} animated={animated} curious={curious} outline={outline} />
        </g>
      )}

      {accessory === "bow" && <g transform={`translate(79 ${sleeping ? 103 : 99})`}><path d="M-12 0 0-7v14Z" fill="#c98276"/><path d="M12 0 0-7v14Z" fill="#c98276"/><circle r="3" fill="#a86f65"/></g>}
      {accessory === "collar" && <path d={sleeping ? "M57 104c15 8 31 8 45 0" : "M55 101c15 9 32 9 47 0"} stroke="#c98276" strokeWidth="5" fill="none" strokeLinecap="round" />}
      {accessory === "bandana" && <path d={sleeping ? "M59 103h40l-20 17Z" : "M58 100h42l-21 18Z"} fill="#8e9c88" />}
      {accessory === "hat" && <g transform={`translate(80 ${sleeping ? 47 : 34})`}><path d="M-17 0h34l-6-21H-10Z" fill="#866b56"/><path d="M-20 0h40" stroke="#6f5848" strokeWidth="5" strokeLinecap="round"/></g>}
      {accessory === "sweater" && !sleeping && <path d="M50 104c18 13 40 13 60 0l-2 27c-17 10-39 10-56 0Z" fill="#d7ad86" opacity=".95" />}
    </svg>
  );
}

function Head({ palette, patched, sleeping, animated, curious, outline, yOffset = 0 }: { palette: { base: string; shade: string; belly: string }; patched: boolean; sleeping: boolean; animated: boolean; curious: boolean; outline: string; yOffset?: number }) {
  return (
    <g transform={`translate(0 ${yOffset})`} style={curious && animated ? { transformOrigin: "79px 69px", animation: "gentle-float 5s ease-in-out infinite" } : undefined}>
      <path d="M48 67c2-12 9-21 20-25l-12-16 24 10c10-1 19 1 27 6l18-15-4 25c6 7 9 15 9 25 0 20-17 33-49 33-31 0-49-13-49-33 0-4 1-7 2-10Z" fill={palette.base} stroke={outline} strokeOpacity=".15" strokeWidth="1.5" />
      <path d="M57 47 54 32l15 10M106 43l14-11-3 17" fill={palette.belly} opacity=".8" />
      {patched && <path d="M56 55c12-12 25-13 34-4 5 6 2 15-7 21-11 1-20-4-27-17Z" fill={palette.shade} opacity=".82" />}

      {sleeping ? (
        <>
          <path d="M63 76c4 4 9 4 13 0M88 76c4 4 9 4 13 0" stroke={outline} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <g style={animated ? { transformOrigin: "69px 75px", animation: "blink 5.7s ease-in-out infinite" } : undefined}><path d="M65 75c2-2 6-2 8 0" stroke={outline} strokeWidth="2.8" strokeLinecap="round" /></g>
          <g style={animated ? { transformOrigin: "94px 75px", animation: "blink 5.7s ease-in-out infinite .12s" } : undefined}><path d="M90 75c2-2 6-2 8 0" stroke={outline} strokeWidth="2.8" strokeLinecap="round" /></g>
        </>
      )}
      <path d="m78 84 5 0-2.5 3.5Z" fill="#b9796a" />
      <path d="M80.5 88c-3 4-7 4-10 2M80.5 88c3 4 7 4 10 2" stroke={outline} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <g stroke={outline} strokeOpacity=".33" strokeWidth="1.2" strokeLinecap="round"><path d="M53 83 31 80M53 89 30 91M108 83l21-3M108 89l22 2"/></g>
    </g>
  );
}
