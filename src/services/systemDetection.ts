// System Detection Service - Detect RAM and recommend model tier

import { ModelTier, SystemSpecs } from '../types/ai.types';

export class SystemDetectionService {
  /**
   * Detect system specifications and recommend appropriate model tier
   */
  static async detectSystemSpecs(): Promise<SystemSpecs> {
    const totalRAM = await this.getTotalRAM();
    const availableRAM = await this.getAvailableRAM();
    const cpuCores = this.getCPUCores();
    const recommendedTier = this.recommendModelTier(totalRAM, availableRAM);

    return {
      totalRAM,
      availableRAM,
      cpuCores,
      recommendedTier
    };
  }

  /**
   * Get total system RAM in GB
   */
  private static async getTotalRAM(): Promise<number> {
    if (window.electron?.systemInfo) {
      const totalBytes = await window.electron.systemInfo.getTotalMemory();
      return Math.round((totalBytes / (1024 ** 3)) * 10) / 10; // Convert to GB, round to 1 decimal
    }
    return 8; // Fallback conservative estimate
  }

  /**
   * Get available RAM in GB
   */
  private static async getAvailableRAM(): Promise<number> {
    if (window.electron?.systemInfo) {
      const freeBytes = await window.electron.systemInfo.getFreeMemory();
      return Math.round((freeBytes / (1024 ** 3)) * 10) / 10;
    }
    return 4; // Fallback conservative estimate
  }

  /**
   * Get number of CPU cores
   */
  private static getCPUCores(): number {
    return navigator.hardwareConcurrency || 4; // Browser API
  }

  /**
   * Recommend model tier based on available RAM
   * - Ultra-light: 4-8GB RAM
   * - Balanced: 8-16GB RAM
   * - High Performance: 16GB+ RAM
   */
  private static recommendModelTier(totalRAM: number, availableRAM: number): ModelTier {
    // Use available RAM for recommendation, as we need headroom for the OS and other apps
    if (availableRAM >= 12 || totalRAM >= 16) {
      return ModelTier.HIGH_PERFORMANCE;
    } else if (availableRAM >= 6 || totalRAM >= 10) {
      return ModelTier.BALANCED;
    } else {
      return ModelTier.ULTRA_LIGHT;
    }
  }

  /**
   * Format RAM for display
   */
  static formatRAM(gb: number): string {
    return `${gb.toFixed(1)} GB`;
  }

  /**
   * Get tier description
   */
  static getTierDescription(tier: ModelTier): string {
    switch (tier) {
      case ModelTier.ULTRA_LIGHT:
        return 'Lightweight models (1-3GB) for basic extraction';
      case ModelTier.BALANCED:
        return 'Balanced models (4-5GB) with good accuracy';
      case ModelTier.HIGH_PERFORMANCE:
        return 'High-performance models (7GB+) for maximum accuracy';
    }
  }

  /**
   * Get tier badge color
   */
  static getTierColor(tier: ModelTier): string {
    switch (tier) {
      case ModelTier.ULTRA_LIGHT:
        return 'text-blue-600 bg-blue-100';
      case ModelTier.BALANCED:
        return 'text-green-600 bg-green-100';
      case ModelTier.HIGH_PERFORMANCE:
        return 'text-purple-600 bg-purple-100';
    }
  }
}
