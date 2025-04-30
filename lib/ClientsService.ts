import { AppwriteService } from "./AppwriteService";
import { NewClient, Client, ClientDocument, Lending } from "./types";
import { LendingService } from "./LendingService";

export class ClientsService {
  private appwrite: AppwriteService;
  private collection: string;
  private lendingService: LendingService;

  constructor() {
    this.collection = "67d48233001460e32636";
    this.appwrite = new AppwriteService();
    this.lendingService = new LendingService();
  }

  async insertClientWithLending(clientData: NewClient): Promise<ClientDocument | null> {
    try {
      const newClientData: Client = {
        nombre: clientData.nombre,
        domicilio: clientData.domicilio,
        numero: clientData.numero,
        periodo: clientData.periodo,
      };

      // Step 1: Create the client record
      const newClient = await this.appwrite.insert<Client>(this.collection, newClientData);

      if (!newClient) throw new Error("Client creation failed");

      // Step 2: If `cantidadPrestamo` exists, create a lending record
      const lendingData: Lending = {
        cliente_id: newClient.$id,
        cantidad: clientData.cantidadPrestamo,
        tasa_interes: clientData.tasa_interes,
        fecha_inicio: new Date().toISOString(),
        fecha_fin: "",
      };

      await this.lendingService.insertLending(lendingData);

      return newClient;
    } catch (error) {
      console.error("Error creating client with lending:", error);
      throw error;
    }
  }

  async getClientById(id: string) {
    return this.appwrite.getById<ClientDocument>(this.collection, id);
  }

  async getAllClients() {
    return this.appwrite.getAll<ClientDocument>(this.collection);
  }

  async updateClient(id: string, data: Client) {
    return this.appwrite.update<Client>(this.collection, id, data);
  }

  async deleteClient(id: string) {
    return this.appwrite.delete(this.collection, id);
  }
}
