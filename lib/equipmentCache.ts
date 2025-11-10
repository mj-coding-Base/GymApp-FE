// Client-side cache for equipment data
// This provides instant loading when navigating between pages
import { Equipment } from "@/types/Equipment";

class EquipmentCache {
  private cache: Equipment[] | null = null;
  private timestamp: number | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  set(data: Equipment[]): void {
    this.cache = data;
    this.timestamp = Date.now();
  }

  get(): Equipment[] | null {
    if (!this.cache || !this.timestamp) {
      return null;
    }

    // Check if cache is still valid
    if (Date.now() - this.timestamp > this.CACHE_DURATION) {
      this.cache = null;
      this.timestamp = null;
      return null;
    }

    return this.cache;
  }

  clear(): void {
    this.cache = null;
    this.timestamp = null;
  }

  isStale(): boolean {
    if (!this.timestamp) return true;
    return Date.now() - this.timestamp > this.CACHE_DURATION;
  }
}

export const equipmentCache = new EquipmentCache();

