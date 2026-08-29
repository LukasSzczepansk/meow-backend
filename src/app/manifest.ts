import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Meow — wasze małe miejsce",
    short_name: "Meow",
    description: "Wspólny koci świat dla dwóch osób.",
    start_url: "/dzis",
    display: "standalone",
    background_color: "#f7f4ee",
    theme_color: "#f7f4ee",
    orientation: "portrait",
    icons: [
      { src: "/meow-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/meow-icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
