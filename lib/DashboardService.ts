import { AppwriteService } from "./AppwriteService";
import { PaymentService } from "./PaymentService";
import { LendingService } from "./LendingService";
import { ClientsService } from "./ClientsService";
import { PaymentDocument, ClientDocument } from "./types";

// Define the interface for chart data
export interface PieChartData {
  name: string;
  quantity: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export interface ClientSummary {
  id: string;
  name: string;
  capitalPaid: number;
  interestPaid: number;
  totalPaid: number;
  lastPaymentDate: string;
}

// Updated Period type with more time period options
export type Period = 
  | "mes_actual"     // Current calendar month
  | "30dias"         // Last 30 days
  | "3meses"         // Last 3 months
  | "6meses"         // Last 6 months
  | "ano_anterior"   // Last year
  | "ano_actual";    // Current year

export class DashboardService {
  private paymentService: PaymentService;
  private lendingService: LendingService;
  private clientsService: ClientsService;

  constructor() {
    this.paymentService = new PaymentService();
    this.lendingService = new LendingService();
    this.clientsService = new ClientsService();
  }

  async getChartData(period: Period): Promise<{
    pieChartData: PieChartData[];
    clientSummaries: ClientSummary[];
  }> {
    try {
      // Get all payments
      const allPayments = await this.paymentService.getAllPatments() || [];
      
      // Get all clients for mapping
      const allClients = await this.clientsService.getAllClients() || [];
      const clientsMap = new Map<string, ClientDocument>();
      allClients.forEach(client => clientsMap.set(client.$id, client));

      if (!allPayments.length) {
        return { 
          pieChartData: this.getEmptyPieChartData(),
          clientSummaries: [] 
        };
      }

      // Filter payments by period
      const filteredPayments = this.filterPaymentsByPeriod(allPayments, period);
      
      // Generate pie chart data
      const pieChartData = this.generatePieChartData(filteredPayments);

      // Generate client summaries
      const clientSummaries = this.generateClientSummaries(filteredPayments, clientsMap);

      return {
        pieChartData,
        clientSummaries
      };
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      return { 
        pieChartData: this.getEmptyPieChartData(),
        clientSummaries: [] 
      };
    }
  }

  private filterPaymentsByPeriod(payments: PaymentDocument[], period: Period): PaymentDocument[] {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    
    // Last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    // Last year
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
    
    // Current year
    const currentYearStart = new Date(now.getFullYear(), 0, 1);
    
    switch (period) {
      case "mes_actual":
        // Current calendar month
        return payments.filter(payment => {
          if (!payment.fecha) return false;
          const paymentDate = new Date(payment.fecha);
          return paymentDate >= firstDayOfMonth && paymentDate <= now;
        });
        
      case "30dias":
        // Last 30 days
        return payments.filter(payment => {
          if (!payment.fecha) return false;
          const paymentDate = new Date(payment.fecha);
          return paymentDate >= thirtyDaysAgo && paymentDate <= now;
        });
        
      case "3meses":
        // Last 3 months
        return payments.filter(payment => {
          if (!payment.fecha) return false;
          const paymentDate = new Date(payment.fecha);
          return paymentDate >= threeMonthsAgo && paymentDate <= now;
        });
        
      case "6meses":
        // Last 6 months
        return payments.filter(payment => {
          if (!payment.fecha) return false;
          const paymentDate = new Date(payment.fecha);
          return paymentDate >= sixMonthsAgo && paymentDate <= now;
        });
        
      case "ano_anterior":
        // Last year
        return payments.filter(payment => {
          if (!payment.fecha) return false;
          const paymentDate = new Date(payment.fecha);
          return paymentDate >= lastYearStart && paymentDate <= lastYearEnd;
        });
        
      case "ano_actual":
        // Current year
        return payments.filter(payment => {
          if (!payment.fecha) return false;
          const paymentDate = new Date(payment.fecha);
          return paymentDate >= currentYearStart && paymentDate <= now;
        });
        
      default:
        return payments;
    }
  }

  private generatePieChartData(payments: PaymentDocument[]): PieChartData[] {
    if (!payments.length) {
      return this.getEmptyPieChartData();
    }
    
    let totalCapital = 0;
    let totalInterest = 0;
    
    payments.forEach(payment => {
      totalCapital += Number(payment.cantidad_capital) || 0;
      totalInterest += Number(payment.cantidad_interes) || 0;
    });
    
    return [
      {
        name: "Capital",
        quantity: totalCapital,
        color: "rgba(131, 167, 234, 1)",  // Blue
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Interés",
        quantity: totalInterest,
        color: "#F00",  // Red
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      }
    ];
  }

  private generateClientSummaries(payments: PaymentDocument[], clientsMap: Map<string, ClientDocument>): ClientSummary[] {
    if (!payments.length) {
      return [];
    }
    
    // Group payments by client
    const clientPayments: Record<string, {
      capitalPaid: number,
      interestPaid: number,
      lastPaymentDate: string
    }> = {};
    
    payments.forEach(payment => {
      if (!payment.cliente_id) return;
      
      if (!clientPayments[payment.cliente_id]) {
        clientPayments[payment.cliente_id] = {
          capitalPaid: 0,
          interestPaid: 0,
          lastPaymentDate: payment.fecha || new Date().toISOString()
        };
      }
      
      const client = clientPayments[payment.cliente_id];
      if (client) {
        client.capitalPaid += Number(payment.cantidad_capital) || 0;
        client.interestPaid += Number(payment.cantidad_interes) || 0;
        
        // Update last payment date if this payment is more recent
        if (payment.fecha) {
          const currentDate = new Date(client.lastPaymentDate);
          const paymentDate = new Date(payment.fecha);
          if (paymentDate > currentDate) {
            client.lastPaymentDate = payment.fecha;
          }
        }
      }
    });
    
    // Convert to array and sort by total amount paid (descending)
    const summaries: ClientSummary[] = [];
    
    Object.entries(clientPayments).forEach(([clientId, data]) => {
      const clientName = clientsMap.get(clientId)?.nombre || "Cliente desconocido";
      
      summaries.push({
        id: clientId,
        name: clientName,
        capitalPaid: data.capitalPaid,
        interestPaid: data.interestPaid,
        totalPaid: data.capitalPaid + data.interestPaid,
        lastPaymentDate: data.lastPaymentDate
      });
    });
    
    return summaries.sort((a, b) => b.totalPaid - a.totalPaid);
  }

  private getEmptyPieChartData(): PieChartData[] {
    return [
      {
        name: "Capital",
        quantity: 0,
        color: "rgba(131, 167, 234, 1)",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Interés",
        quantity: 0,
        color: "#F00",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      }
    ];
  }
} 