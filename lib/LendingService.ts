import { AppwriteService } from "./AppwriteService";
import { Lending, LendingDocument } from "./types";

export const periodToDays = {
  mensual: 30,
  quincenal: 15,
  catorcenal: 14,
};

export class LendingService {
  private appwrite: AppwriteService;
  private collection: string;

  constructor() {
    this.appwrite = new AppwriteService();
    this.collection = "67dca9690003b8f3486e"; 
  }

  async insertLending(lendingData: Lending): Promise<LendingDocument | null> {
    try {
      const lending = await this.appwrite.insert<Lending>(this.collection, lendingData);
      return lending;
    } catch (error) {
      console.error("Error creating lending:", error);
      return null;
    }
  }

  async getLendingById(id: string) {
    try {
      console.log("Getting lending with ID:", id);
      const result = await this.appwrite.getById<LendingDocument>(this.collection, id);
      console.log("Lending service result:", result);
      
      if (!result) {
        console.log("No lending found with ID:", id);
        return null;
      }
      
      return result;
    } catch (error) {
      console.error("Error in getLendingById:", error);
      return null;
    }
  }

  async getLendingsByClientId(clientId: string): Promise<LendingDocument[] | null> {
    return await this.appwrite.getWhere<LendingDocument>(this.collection, "cliente_id", clientId);
  }

  async getActiveLendingsByClientId(clientId: string): Promise<LendingDocument[] | null> {
    try {
      // Get all loans for the client
      const lendings = await this.getLendingsByClientId(clientId);
      
      if (!lendings) return null;
      
      // Filter out loans that have a fecha_fin (which means they're paid off)
      return lendings.filter(lending => !lending.fecha_fin);
    } catch (error) {
      console.error("Error getting active lendings:", error);
      return null;
    }
  }

  async getAllActiveLendings(): Promise<LendingDocument[] | null> {
    try {
      // Get all lendings
      const lendings = await this.appwrite.getAll<LendingDocument>(this.collection);
      
      if (!lendings) return null;
      
      // Filter out loans that have a fecha_fin (which means they're paid off)
      return lendings.filter(lending => !lending.fecha_fin);
    } catch (error) {
      console.error("Error getting all active lendings:", error);
      return null;
    }
  }

  calculateInterestUntilToday({
    capital,
    tasa_interes,
    lastPaymentDate,
    period,
  }: {
    capital: number;
    tasa_interes: number;
    lastPaymentDate: string;
    period: keyof typeof periodToDays;
  }): number {
    const now = new Date();
    const lastDate = new Date(lastPaymentDate);
    const diffTime = now.getTime() - lastDate.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const periodDays = periodToDays[period];
    if (!periodDays) {
      throw new Error(`Unsupported period: ${period}`);
    }

    const interestRatePerDay = tasa_interes / periodDays;
    const totalInterest = (capital * interestRatePerDay * daysPassed) / 100;

    return parseFloat(totalInterest.toFixed(2));
  }

  
}
