import { FGNTenure } from "../types";

// Utility file for file icon management
export const fileIcons = [
  { value: "pdf", label: "PDF Document", extension: ".svg" },
  { value: "excel", label: "Excel Spreadsheet", extension: ".svg" },
  { value: "word", label: "Word Document", extension: ".svg" },
  { value: "powerpoint", label: "PowerPoint Presentation", extension: ".svg" },
  { value: "image", label: "Image", extension: ".svg" },
  //   { value: "zip", label: "Archive/ZIP", extension: ".png" },
  { value: "file", label: "General File", extension: ".svg" },
  // { value: 'uploadwhite', label: 'Upload Icon', extension: '.svg' }
];

export const getFileIconByType = (fileType: string): string => {
  if (fileType.includes("pdf")) return "pdf";
  if (
    fileType.includes("excel") ||
    fileType.includes("spreadsheet") ||
    fileType.includes("sheet")
  )
    return "excel";
  if (fileType.includes("word") || fileType.includes("document")) return "word";
  if (fileType.includes("powerpoint") || fileType.includes("presentation"))
    return "powerpoint";
  if (fileType.includes("image")) return "image";
  if (
    fileType.includes("zip") ||
    fileType.includes("archive") ||
    fileType.includes("compressed")
  )
    return "zip";
  return "file";
};

export const defaultFGNBonds = [
  { label: "5-YEAR", rate: 12.5 },
  { label: "10-YEAR", rate: 13.25 },
  { label: "15-YEAR", rate: 13.75 },
  { label: "20-YEAR", rate: 14.0 },
];

export const defaultFGNTBills = [
  { label: "91-DAY", rate: 10.5 },
  { label: "182-DAY", rate: 11.25 },
  { label: "364-DAY", rate: 12.0 },
];
