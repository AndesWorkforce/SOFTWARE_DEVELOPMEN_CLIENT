declare module "react-country-flag" {
  import { CSSProperties } from "react";

  interface ReactCountryFlagProps {
    countryCode?: string;
    svg?: boolean;
    cdnUrl?: string;
    cdnSuffix?: string;
    style?: CSSProperties;
    title?: string;
    className?: string;
    "aria-label"?: string;
  }

  const ReactCountryFlag: React.FC<ReactCountryFlagProps>;
  export default ReactCountryFlag;
}
