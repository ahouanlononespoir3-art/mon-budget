import type { Currency } from "../types/finance";

export const CURRENCY_OPTIONS: Array<{
  value: Currency;
  label: string;
  locale: string;
}> = [
  { value: "XOF", label: "XOF — Franc CFA BCEAO", locale: "fr-FR" },
  { value: "EUR", label: "EUR — Euro", locale: "fr-FR" },
  { value: "USD", label: "USD — Dollar américain", locale: "en-US" },
  { value: "GBP", label: "GBP — Livre sterling", locale: "en-GB" },
  { value: "CAD", label: "CAD — Dollar canadien", locale: "fr-CA" },
  { value: "MAD", label: "MAD — Dirham marocain", locale: "fr-MA" },
  { value: "NGN", label: "NGN — Naira nigérian", locale: "en-NG" },
  { value: "GHS", label: "GHS — Cedi ghanéen", locale: "en-GH" },
];

export function getCurrencyLabel(currency: Currency): string {
  return CURRENCY_OPTIONS.find((option) => option.value === currency)?.label ?? currency;
}

export function getCurrencyLocale(currency: Currency): string {
  return CURRENCY_OPTIONS.find((option) => option.value === currency)?.locale ?? "fr-FR";
}

export function getStoredCurrency(): Currency {
  if (typeof localStorage === "undefined") return "XOF";

  try {
    const stored = localStorage.getItem("mon-budget:settings");
    const currency = stored ? (JSON.parse(stored) as { currency?: Currency }).currency : undefined;
    return CURRENCY_OPTIONS.some((option) => option.value === currency) ? currency as Currency : "XOF";
  } catch {
    return "XOF";
  }
}
