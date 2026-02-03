/**
 * Convierte nombres de países a códigos ISO de 2 letras para usar con react-country-flag
 * @param countryName - Nombre del país (ej: "Colombia", "United States")
 * @returns Código ISO de 2 letras (ej: "CO", "US") o null si no se encuentra
 */
export const getCountryCode = (countryName: string | undefined | null): string | null => {
  if (!countryName) return null;
  
  const countryMap: Record<string, string> = {
    "Colombia": "CO",
    "United States": "US",
    "United States of America": "US",
    "USA": "US",
    "México": "MX",
    "Mexico": "MX",
    "Argentina": "AR",
    "Chile": "CL",
    "Peru": "PE",
    "Perú": "PE",
    "Ecuador": "EC",
    "Venezuela": "VE",
    "Bolivia": "BO",
    "Paraguay": "PY",
    "Uruguay": "UY",
    "Brazil": "BR",
    "Brasil": "BR",
    "España": "ES",
    "Spain": "ES",
    "Canada": "CA",
    "United Kingdom": "GB",
    "UK": "GB",
    "France": "FR",
    "Germany": "DE",
    "Italy": "IT",
    "Portugal": "PT",
    "Netherlands": "NL",
    "Belgium": "BE",
    "Switzerland": "CH",
    "Austria": "AT",
    "Poland": "PL",
    "Sweden": "SE",
    "Norway": "NO",
    "Denmark": "DK",
    "Finland": "FI",
    "Greece": "GR",
    "Turkey": "TR",
    "Russia": "RU",
    "China": "CN",
    "Japan": "JP",
    "South Korea": "KR",
    "India": "IN",
    "Australia": "AU",
    "New Zealand": "NZ",
    "South Africa": "ZA",
    "Egypt": "EG",
    "Israel": "IL",
    "Saudi Arabia": "SA",
    "United Arab Emirates": "AE",
    "UAE": "AE",
  };
  
  // Buscar coincidencia exacta (case-insensitive)
  const normalized = countryName.trim();
  const code = countryMap[normalized] || countryMap[Object.keys(countryMap).find(key => key.toLowerCase() === normalized.toLowerCase()) || ""];
  
  return code || null;
};

