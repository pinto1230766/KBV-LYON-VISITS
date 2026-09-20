import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Checks if a name corresponds to an example/placeholder entity.
 */
export const isExampleName = (n?: string) => {
  const low = (n || "").toLowerCase();
  return (
    low.includes("exemple") ||
    low.includes("example") ||
    low.includes("jean dupont") ||
    low.includes("jean-dupont") ||
    low.includes("marie martin")
  );
};

/**
 * Split an array into chunks of a given size.
 */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}
