import { AppwriteService } from "./AppwriteService";
import { Payment, PaymentDocument, LendingDocument } from "./types";
import { LendingService, periodToDays } from "./LendingService";

export class PaymentService {
  private appwrite: AppwriteService;
  private collection: string;
  private lendingService: LendingService;

  constructor() {
    this.appwrite = new AppwriteService();
    this.collection = "67dcaa520027aa7c82f9"; 
    this.lendingService = new LendingService();
  }

  async insertPayment(paymentData: Payment): Promise<PaymentDocument | null> {
    try {
      const payment = await this.appwrite.insert<Payment>(this.collection, paymentData);
      return payment;
    } catch (error) {
      console.error("Error creating payment:", error);
      return null;
    }
  }

  async getAllPatments(){
    return this.appwrite.getAll<PaymentDocument>(this.collection);
  }

  async getPaymentById(id: string) {
    return this.appwrite.getById<PaymentDocument>(this.collection, id);
  }

  async getPaymentsByClientId(clientId: string): Promise<PaymentDocument[] | null> {
    return await this.appwrite.getWhere<PaymentDocument>(this.collection, "cliente_id", clientId);
  }

  async getPaymentsByPrestamoId(prestamoId: string): Promise<PaymentDocument[] | null> {
    return await this.appwrite.getWhere<PaymentDocument>(this.collection, "prestamo_id", prestamoId);
  }

  async calculateInterestForLending(lendingId: string, clientPeriod: keyof typeof periodToDays): Promise<{
    interest: number;
    remainingCapital: number;
    lastPaymentDate: string;
  }> {
    try {
      // Get the lending information
      const lendingData = await this.lendingService.getLendingById(lendingId);
      if (!lendingData) {
        throw new Error("Préstamo no encontrado");
      }

      // Get all payments for this lending
      const paymentData = await this.getPaymentsByPrestamoId(lendingId);
      const safePayments = paymentData ?? [];

      // Calculate the last payment date (or loan start date if no payments)
      const lastPaymentDate =
        safePayments.length > 0 && safePayments[0]?.fecha
          ? safePayments[0].fecha
          : lendingData.fecha_inicio;

      // Calculate how much has been paid in capital
      const capitalPaid = safePayments.reduce(
        (sum, p) => sum + (p.cantidad_capital ?? 0),
        0
      );

      // Calculate remaining capital
      const remainingCapital = lendingData.cantidad - capitalPaid;

      // Calculate interest owed to date
      const interest = this.lendingService.calculateInterestUntilToday({
        capital: remainingCapital,
        tasa_interes: lendingData.tasa_interes,
        lastPaymentDate,
        period: clientPeriod,
      });

      return {
        interest,
        remainingCapital,
        lastPaymentDate
      };
    } catch (error) {
      console.error("Error calculating interest:", error);
      throw error;
    }
  }

  async markLendingAsCompleted(lendingId: string): Promise<boolean> {
    try {
      const lendingData = await this.lendingService.getLendingById(lendingId);
      if (!lendingData) {
        throw new Error("Préstamo no encontrado");
      }

      // Update the lending with fecha_fin
      const now = new Date();
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23, // hour
        59, // minute
        59  // seconds
      );

      const updatedLending = {
        ...lendingData,
        fecha_fin: endOfDay.toISOString()
      };

      await this.appwrite.update(
        "67dca9690003b8f3486e", // lending collection ID
        lendingId, 
        updatedLending
      );

      return true;
    } catch (error) {
      console.error("Error marking lending as completed:", error);
      return false;
    }
  }
}
