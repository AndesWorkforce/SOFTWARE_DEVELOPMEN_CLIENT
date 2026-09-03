"use client";

import { useId, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { X, TriangleAlert } from "lucide-react";

/**
 * Nombres genéricos que no identifican un equipo en particular. Espeja
 * INVALID_HOSTNAMES de USER_MS (`src/common/hostname.util.ts`): el backend los
 * descarta en silencio, así que sin este chequeo el usuario cargaría "LOCALHOST",
 * vería el chip y al guardar desaparecería sin explicación.
 */
const INVALID_HOSTNAMES = new Set([
  "LOCALHOST",
  "COMPUTERNAME",
  "HOSTNAME",
  "UNKNOWN",
  "NONE",
  "N/A",
  "NA",
]);

/**
 * Largo máximo de un nombre NetBIOS. El agente reporta COMPUTERNAME, que Windows
 * trunca a 15 caracteres, así que un nombre más largo cargado acá nunca va a
 * coincidir con lo que llega en el registro. No se bloquea —los nombres de AD
 * suelen listarse completos y existe el script de truncación— pero se avisa.
 */
const NETBIOS_MAX_LENGTH = 15;

/**
 * Normaliza igual que el backend: trim + mayúsculas. Windows trata los nombres
 * de equipo como case-insensitive, y el auto-vínculo matchea por igualdad
 * exacta, así que ambos lados tienen que guardar la misma forma.
 */
export function normalizeHostname(raw: string): string {
  return raw.trim().toUpperCase();
}

export interface HostnameInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Texto de ayuda bajo el campo. */
  hint?: string;
  /** Mensaje cuando el equipo ya está en la lista. */
  duplicateMessage?: string;
  /** Mensaje cuando el nombre es genérico (LOCALHOST y compañía). */
  invalidMessage?: string;
  /** Aviso, no bloqueante, para nombres de más de 15 caracteres. */
  tooLongMessage?: string;
  "aria-label"?: string;
}

/**
 * Carga de equipos (COMPUTERNAME) como chips.
 *
 * Se eligió chips y no un campo de texto separado por comas porque la lista es
 * la llave del auto-vínculo: cada valor tiene que quedar visible y borrable por
 * separado, y un typo escondido dentro de una cadena larga es justo el error que
 * deja a un agente sin vincular sin que nadie note por qué.
 */
export function HostnameInput({
  value,
  onChange,
  placeholder = "Type a computer name and press Enter...",
  disabled = false,
  hint,
  duplicateMessage = "That computer is already on the list",
  invalidMessage = "That name is too generic to identify a computer",
  tooLongMessage = "Longer than 15 characters: the agent reports a truncated name and this one will not match",
  "aria-label": ariaLabel = "Computers",
}: HostnameInputProps) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  /**
   * Agrega uno o varios equipos. Devuelve lo que no se pudo agregar para que el
   * draft no se pierda cuando el valor era inválido.
   */
  const commit = (raw: string): boolean => {
    const normalized = normalizeHostname(raw);
    if (!normalized) return true; // Vacío: no es un error, simplemente no agrega.

    if (INVALID_HOSTNAMES.has(normalized)) {
      setError(invalidMessage);
      return false;
    }
    if (value.includes(normalized)) {
      setError(duplicateMessage);
      return false;
    }

    setError(null);
    onChange([...value, normalized]);
    return true;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "," || event.key === " ") {
      // Enter dentro de un modal dispara el submit del form; se corta acá
      // porque acá significa "agregar este equipo", no "guardar todo".
      event.preventDefault();
      if (commit(draft)) setDraft("");
      return;
    }

    // Backspace con el campo vacío borra el último chip: es el gesto esperado
    // en cualquier input de tags y evita tener que apuntar a la X.
    if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
      setError(null);
    }
  };

  /**
   * Pegar una columna entera es el camino real de carga masiva: los equipos
   * suelen venir de una planilla. Se separa por coma, punto y coma y saltos de
   * línea, y se agregan todos de una.
   */
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text");
    if (!/[\s,;]/.test(text)) return; // Un solo valor: dejar el pegado normal.

    event.preventDefault();
    const candidates = text
      .split(/[\s,;]+/)
      .map(normalizeHostname)
      .filter(Boolean);

    const seen = new Set(value);
    const added: string[] = [];
    for (const candidate of candidates) {
      if (INVALID_HOSTNAMES.has(candidate) || seen.has(candidate)) continue;
      seen.add(candidate);
      added.push(candidate);
    }

    if (added.length) {
      onChange([...value, ...added]);
      setError(null);
    }
    setDraft("");
  };

  const remove = (hostname: string) => {
    onChange(value.filter((item) => item !== hostname));
    setError(null);
  };

  return (
    <div className="w-full">
      <div
        className={`flex w-full flex-wrap items-center gap-2 rounded-[10px] border px-[10px] py-[8px] min-h-[45px] ${
          disabled ? "bg-[#f5f5f5]" : "bg-white"
        }`}
        style={{ borderColor: error ? "#ef4444" : "#b6b4b4" }}
        // Clic en cualquier parte del contenedor enfoca el input: el área de
        // los chips ocupa la mayor parte del control y sería una zona muerta.
        onClick={() => document.getElementById(id)?.focus()}
      >
        {value.map((hostname) => {
          const tooLong = hostname.length > NETBIOS_MAX_LENGTH;
          return (
            <span
              key={hostname}
              title={tooLong ? tooLongMessage : undefined}
              className={`inline-flex items-center gap-1 rounded-[6px] px-2 py-[3px] text-[13px] font-medium ${
                tooLong
                  ? "bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]"
                  : "bg-[#e6f6f9] text-[#00697f] border border-[#b8e4ec]"
              }`}
            >
              {tooLong && <TriangleAlert className="size-3.5 shrink-0" aria-hidden />}
              {hostname}
              {!disabled && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    remove(hostname);
                  }}
                  aria-label={`Remove ${hostname}`}
                  className="cursor-pointer opacity-60 hover:opacity-100"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              )}
            </span>
          );
        })}

        <input
          id={id}
          type="text"
          value={draft}
          disabled={disabled}
          aria-label={ariaLabel}
          onChange={(event) => {
            setDraft(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          // Sin esto, escribir un equipo y darle a Guardar sin confirmar con
          // Enter lo descartaría en silencio.
          onBlur={() => {
            if (commit(draft)) setDraft("");
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[140px] flex-1 border-none bg-transparent p-0 text-[15px] md:text-[16px] text-black outline-none placeholder:text-[#b6b4b4] disabled:cursor-not-allowed"
        />
      </div>

      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}
