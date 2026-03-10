/**
 * Convierte nombres de países a códigos ISO de 2 letras para usar con react-country-flag
 * @param countryName - Nombre del país (ej: "Colombia", "United States")
 * @returns Código ISO de 2 letras (ej: "CO", "US") o null si no se encuentra
 */
export const getCountryCode = (countryName: string | undefined | null): string | null => {
  if (!countryName) return null;

  const countryMap: Record<string, string> = {
    Colombia: "CO",
    "United States": "US",
    "United States of America": "US",
    USA: "US",
    México: "MX",
    Mexico: "MX",
    Argentina: "AR",
    Chile: "CL",
    Peru: "PE",
    Perú: "PE",
    Ecuador: "EC",
    Venezuela: "VE",
    Bolivia: "BO",
    Paraguay: "PY",
    Uruguay: "UY",
    Brazil: "BR",
    Brasil: "BR",
    España: "ES",
    Spain: "ES",
    Canada: "CA",
    "United Kingdom": "GB",
    UK: "GB",
    France: "FR",
    Germany: "DE",
    Italy: "IT",
    Portugal: "PT",
    Netherlands: "NL",
    Belgium: "BE",
    Switzerland: "CH",
    Austria: "AT",
    Poland: "PL",
    Sweden: "SE",
    Norway: "NO",
    Denmark: "DK",
    Finland: "FI",
    Greece: "GR",
    Turkey: "TR",
    Russia: "RU",
    China: "CN",
    Japan: "JP",
    "South Korea": "KR",
    India: "IN",
    Australia: "AU",
    "New Zealand": "NZ",
    "South Africa": "ZA",
    Egypt: "EG",
    Israel: "IL",
    "Saudi Arabia": "SA",
    "United Arab Emirates": "AE",
    UAE: "AE",
  };

  // Buscar coincidencia exacta (case-insensitive)
  const normalized = countryName.trim();
  const code =
    countryMap[normalized] ||
    countryMap[
      Object.keys(countryMap).find((key) => key.toLowerCase() === normalized.toLowerCase()) || ""
    ];

  return code || null;
};

/**
 * Lista estática de países para usar en selects/dropdowns.
 * Usar esta lista en lugar de extraer países de la BD para garantizar
 * opciones consistentes independientemente de los datos existentes.
 */
export const COUNTRY_OPTIONS: { value: string; label: string }[] = [
  { value: "Argentina", label: "Argentina" },
  { value: "Australia", label: "Australia" },
  { value: "Austria", label: "Austria" },
  { value: "Belgium", label: "Belgium" },
  { value: "Bolivia", label: "Bolivia" },
  { value: "Brazil", label: "Brazil" },
  { value: "Canada", label: "Canada" },
  { value: "Chile", label: "Chile" },
  { value: "China", label: "China" },
  { value: "Colombia", label: "Colombia" },
  { value: "Denmark", label: "Denmark" },
  { value: "Ecuador", label: "Ecuador" },
  { value: "Egypt", label: "Egypt" },
  { value: "Finland", label: "Finland" },
  { value: "France", label: "France" },
  { value: "Germany", label: "Germany" },
  { value: "Greece", label: "Greece" },
  { value: "India", label: "India" },
  { value: "Israel", label: "Israel" },
  { value: "Italy", label: "Italy" },
  { value: "Japan", label: "Japan" },
  { value: "Mexico", label: "Mexico" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Norway", label: "Norway" },
  { value: "Paraguay", label: "Paraguay" },
  { value: "Peru", label: "Peru" },
  { value: "Poland", label: "Poland" },
  { value: "Portugal", label: "Portugal" },
  { value: "Russia", label: "Russia" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "South Africa", label: "South Africa" },
  { value: "South Korea", label: "South Korea" },
  { value: "Spain", label: "Spain" },
  { value: "Sweden", label: "Sweden" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "Turkey", label: "Turkey" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States", label: "United States" },
  { value: "Uruguay", label: "Uruguay" },
  { value: "Venezuela", label: "Venezuela" },
];
