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
  label: string; // For bonds: "5-YEAR", "10-YEAR", etc. For T-bills: "91-DAY", "182-DAY", etc.
  rate: number; // Interest rate percentage
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

export interface ResourceFile {
  id: string;
  name: string;
  url: string;
  fileType: string;
  uploadDate: string;
  category: string;
  path: string;
  icon: string; // Updated to include icon per file
}

export interface ResourceCategory {
  id: string;
  name: string;
  displayOrder: number;
}

export interface TopStock {
  id: string;
  symbol: string;
  previousDayClose: number;
  currentDayClose: number;
  change: number;
  displayOrder: number;
}

export interface EquityMarketList {
  id: string;
  type: "gainers" | "losers";
  stocks: TopStock[];
  lastUpdated: string;
}
