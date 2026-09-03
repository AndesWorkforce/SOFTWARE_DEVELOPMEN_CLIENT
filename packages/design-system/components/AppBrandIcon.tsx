"use client";

import {
  SiAsana,
  SiAsanaHex,
  SiBrave,
  SiBraveHex,
  SiClaude,
  SiClaudeHex,
  SiClickup,
  SiClickupHex,
  SiDbeaver,
  SiDbeaverHex,
  SiDiscord,
  SiDiscordHex,
  SiDocker,
  SiDockerHex,
  SiDropbox,
  SiDropboxHex,
  SiFigma,
  SiFigmaHex,
  SiFirefox,
  SiFirefoxHex,
  SiGithub,
  SiGithubHex,
  SiGmail,
  SiGmailHex,
  SiGoogle,
  SiGoogleHex,
  SiGooglechrome,
  SiGooglechromeHex,
  SiIntellijidea,
  SiIntellijideaHex,
  SiJira,
  SiJiraHex,
  SiNetflix,
  SiNetflixHex,
  SiNotion,
  SiNotionHex,
  SiOpera,
  SiOperaHex,
  SiPostman,
  SiPostmanHex,
  SiPycharm,
  SiPycharmHex,
  SiSpotify,
  SiSpotifyHex,
  SiSteam,
  SiSteamHex,
  SiSublimetext,
  SiSublimetextHex,
  SiTelegram,
  SiTelegramHex,
  SiTrello,
  SiTrelloHex,
  SiVlcmediaplayer,
  SiVlcmediaplayerHex,
  SiWhatsapp,
  SiWhatsappHex,
  SiYoutube,
  SiYoutubeHex,
  SiZoom,
  SiZoomHex,
} from "@icons-pack/react-simple-icons";
import { useState } from "react";
import type { ComponentType } from "react";

/**
 * Iconos de marca para apps y dominios.
 *
 * COBERTURA REAL, medida contra el uso de produccion del 2026-09-03: los logos
 * de marca alcanzan ~43% del tiempo de uso. Simple Icons removio los iconos de
 * Microsoft y de varias marcas grandes por pedidos de marca registrada, asi que
 * NO existen Teams, Edge, Slack, Word, Excel, Outlook ni VS Code — que son
 * justamente varias de las apps mas usadas. Tampoco existen las apps internas
 * o de nicho (Cebod, Msrdc, LawRuler, 3CX).
 *
 * Por eso el logo real es el caso feliz y no la regla: lo que sostiene la vista
 * es el avatar de letra, que cubre el 100% con un color estable por nombre.
 *
 * Para DOMINIOS hay una tercera via: el favicon del sitio, que cubre casi
 * cualquier host. Se usa despues del logo de marca y antes del avatar, y se
 * degrada solo si la imagen falla. Ver FAVICON_ENDPOINT sobre su costo.
 */

/**
 * Servicio de favicons.
 *
 * OJO, tiene implicancia de privacidad: cada icono renderizado le revela a un
 * tercero un dominio que visito alguien de la empresa. Se eligio DuckDuckGo
 * sobre el equivalente de Google por su politica de no perfilar usuarios, pero
 * sigue siendo trafico saliente con los sitios visitados. Para volver a un
 * modo totalmente offline alcanza con poner esta constante en null: el
 * componente cae al avatar de letra sin ningun otro cambio.
 */
const FAVICON_ENDPOINT: ((domain: string) => string) | null = (domain) =>
  `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;

/** Host limpio: sin protocolo, sin www., sin puerto, sin path. */
function cleanDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split("?")[0]
    .split(":")[0];
}

type IconComponent = ComponentType<{ size?: number; color?: string; className?: string }>;

interface BrandIcon {
  Icon: IconComponent;
  color: string;
}

/**
 * Claves normalizadas (minusculas, sin separadores) a icono de marca.
 * El nombre de la app llega de `normalize()` del agente y el del dominio de
 * `normalize_domain()`, asi que se compara por inclusion sobre el texto
 * normalizado: 'app.clickup.com' y 'Clickup' caen ambos en 'clickup'.
 */
const BRANDS: Array<{ keys: string[]; brand: BrandIcon }> = [
  { keys: ["chrome"], brand: { Icon: SiGooglechrome, color: SiGooglechromeHex } },
  { keys: ["brave"], brand: { Icon: SiBrave, color: SiBraveHex } },
  { keys: ["opera"], brand: { Icon: SiOpera, color: SiOperaHex } },
  { keys: ["firefox"], brand: { Icon: SiFirefox, color: SiFirefoxHex } },
  { keys: ["zoom"], brand: { Icon: SiZoom, color: SiZoomHex } },
  { keys: ["claude"], brand: { Icon: SiClaude, color: SiClaudeHex } },
  { keys: ["clickup"], brand: { Icon: SiClickup, color: SiClickupHex } },
  { keys: ["notion"], brand: { Icon: SiNotion, color: SiNotionHex } },
  { keys: ["whatsapp"], brand: { Icon: SiWhatsapp, color: SiWhatsappHex } },
  { keys: ["discord"], brand: { Icon: SiDiscord, color: SiDiscordHex } },
  { keys: ["telegram"], brand: { Icon: SiTelegram, color: SiTelegramHex } },
  { keys: ["spotify"], brand: { Icon: SiSpotify, color: SiSpotifyHex } },
  { keys: ["netflix"], brand: { Icon: SiNetflix, color: SiNetflixHex } },
  { keys: ["steam"], brand: { Icon: SiSteam, color: SiSteamHex } },
  { keys: ["vlc"], brand: { Icon: SiVlcmediaplayer, color: SiVlcmediaplayerHex } },
  { keys: ["figma"], brand: { Icon: SiFigma, color: SiFigmaHex } },
  { keys: ["github"], brand: { Icon: SiGithub, color: SiGithubHex } },
  { keys: ["dropbox"], brand: { Icon: SiDropbox, color: SiDropboxHex } },
  { keys: ["postman"], brand: { Icon: SiPostman, color: SiPostmanHex } },
  { keys: ["dbeaver"], brand: { Icon: SiDbeaver, color: SiDbeaverHex } },
  { keys: ["pycharm"], brand: { Icon: SiPycharm, color: SiPycharmHex } },
  { keys: ["intellij"], brand: { Icon: SiIntellijidea, color: SiIntellijideaHex } },
  { keys: ["sublime"], brand: { Icon: SiSublimetext, color: SiSublimetextHex } },
  { keys: ["docker"], brand: { Icon: SiDocker, color: SiDockerHex } },
  { keys: ["jira"], brand: { Icon: SiJira, color: SiJiraHex } },
  { keys: ["trello"], brand: { Icon: SiTrello, color: SiTrelloHex } },
  { keys: ["asana"], brand: { Icon: SiAsana, color: SiAsanaHex } },
  { keys: ["youtube"], brand: { Icon: SiYoutube, color: SiYoutubeHex } },
  // 'gmail' antes que 'google': 'mail.google.com' es Gmail, no la busqueda.
  { keys: ["gmail", "mail.google"], brand: { Icon: SiGmail, color: SiGmailHex } },
  { keys: ["google"], brand: { Icon: SiGoogle, color: SiGoogleHex } },
];

/** Paleta del avatar de letra. Suficientemente separadas para distinguirse. */
const AVATAR_COLORS = [
  "#0097B2",
  "#7C3AED",
  "#DB2777",
  "#EA580C",
  "#16A34A",
  "#2563EB",
  "#CA8A04",
  "#DC2626",
  "#0D9488",
  "#4F46E5",
];

const normalize = (value: string) => value.toLowerCase().replace(/[\s_-]/g, "");

function findBrand(name: string): BrandIcon | null {
  const n = normalize(name);
  for (const { keys, brand } of BRANDS) {
    if (keys.some((k) => n.includes(normalize(k)))) return brand;
  }
  return null;
}

/**
 * Color estable por nombre: la misma app siempre sale del mismo color, entre
 * recargas y entre contratistas. Un color aleatorio haria que la vista se vea
 * distinta cada vez y perderia el valor de reconocimiento.
 */
function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Primer caracter alfanumerico; los dominios pierden el 'www.' antes. */
function initial(name: string): string {
  const clean = name.replace(/^www\./i, "");
  const match = clean.match(/[a-z0-9]/i);
  return (match?.[0] ?? "?").toUpperCase();
}

export interface AppBrandIconProps {
  /** Nombre de la app o dominio tal como lo reporta el agente. */
  name: string;
  /** Lado del icono en px. */
  size?: number;
  /**
   * `domain` habilita el favicon como paso intermedio. Se pasa explicitamente
   * en vez de deducirlo por la presencia de un punto: hay apps con punto en el
   * nombre y no queremos salir a la red por ellas.
   */
  kind?: "app" | "domain";
  className?: string;
}

export const AppBrandIcon = ({ name, size = 28, kind = "app", className }: AppBrandIconProps) => {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const brand = findBrand(name);

  // El logo de marca gana sobre el favicon: es vectorial, no sale a la red y no
  // filtra el dominio. El favicon cubre lo que la libreria no tiene.
  if (!brand && kind === "domain" && FAVICON_ENDPOINT && !faviconFailed) {
    const host = cleanDomain(name);
    if (host) {
      return (
        <span
          className={`inline-flex items-center justify-center shrink-0 rounded-lg overflow-hidden ${className ?? ""}`}
          style={{ width: size, height: size, background: "#F1F5F9" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- next/image
              exigiria declarar el host en remotePatterns y pasar iconos de 16px
              por el pipeline de optimizacion, que no aporta nada a este tamanio. */}
          <img
            src={FAVICON_ENDPOINT(host)}
            alt=""
            width={Math.round(size * 0.62)}
            height={Math.round(size * 0.62)}
            loading="lazy"
            onError={() => setFaviconFailed(true)}
            style={{ objectFit: "contain" }}
          />
        </span>
      );
    }
  }

  if (brand) {
    const { Icon, color } = brand;
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 rounded-lg ${className ?? ""}`}
        style={{ width: size, height: size, background: `${color}1A` }}
        aria-hidden="true"
      >
        <Icon size={Math.round(size * 0.6)} color={color} />
      </span>
    );
  }

  const color = avatarColor(name);
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-lg font-semibold ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: `${color}1A`,
        color,
        fontSize: Math.round(size * 0.45),
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {initial(name)}
    </span>
  );
};
