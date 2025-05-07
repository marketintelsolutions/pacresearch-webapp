export interface Stock {
  id: string;
  symbol: string;
  previousDayClose: number;
  currentDayClose: number;
  change: number;
}

export interface MacroeconomicData {
  id?: string;
  date: string;
  percentage: number;
}

export interface ExchangeRateData {
  id?: string;
  price: number;
}

export interface ASIData {
  id?: string;
  value: number;
  change: number;
  date: string;
}

export interface FGNTenure {
  days: number;
  rate: number;
  label: string;
}

export interface FGNData {
  id?: string;
  type: "BONDS" | "T-BILLS";
  tenures: FGNTenure[];
}

export interface Stock {
  id: string;
  symbol: string;
  previousDayClose: number;
  currentDayClose: number;
  change: number;
}
