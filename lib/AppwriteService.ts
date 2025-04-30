import { Client, Databases, ID, Models, Query } from "appwrite";

export class AppwriteService {
  private client: Client;
  private database: Databases;
  private databaseId: string;

  constructor() {
    this.client = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your endpoint
      .setProject("67d474730020d4128c35"); // Replace with your project ID

    this.database = new Databases(this.client);
    this.databaseId = "67d476550025aaeef6c9"; // Replace with your database ID
  }

  async insert<T extends Omit<Models.Document, keyof Models.Document>>(table: string, data: T): Promise<T & Models.Document | null> {
    try {
      const response = await this.database.createDocument(this.databaseId, table, ID.unique(), data);
      return response as unknown as T & Models.Document;
    } catch (error) {
      console.error("Insert Error:", error);
      return null;
    }
  }

  async getById<T extends Models.Document>(table: string, id: string): Promise<T | null> {
    try {
      const response = await this.database.getDocument(this.databaseId, table, id);
      return response as unknown as T;
    } catch (error) {
      console.error("GetById Error:", error);
      return null;
    }
  }

  async getAll<T extends Models.Document>(table: string): Promise<T[] | null> {
    try {
      const response = await this.database.listDocuments(this.databaseId, table);
      return response.documents as unknown as T[];
    } catch (error) {
      console.error("GetAll Error:", error);
      return null;
    }
  }

  async update<T extends Partial<Omit<Models.Document, keyof Models.Document>>>(table: string, id: string, data: T): Promise<T | null> {
    try {
      // Filter out Appwrite system fields that begin with $
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([key]) => !key.startsWith('$'))
      ) as T;
      
      const response = await this.database.updateDocument(this.databaseId, table, id, filteredData);
      return response as unknown as T;
    } catch (error) {
      console.error("Update Error:", error);
      return null;
    }
  }

  async delete(table: string, id: string): Promise<boolean> {
    try {
      await this.database.deleteDocument(this.databaseId, table, id);
      return true;
    } catch (error) {
      console.error("Delete Error:", error);
      return false;
    }
  }

  async getWhere<T extends Models.Document>(table: string, field: string, value: string): Promise<T[] | null> {
    try {
      const response = await this.database.listDocuments(this.databaseId, table, [
        Query.equal(field, value),
      ]);
      return response.documents as unknown as T[];
    } catch (error) {
      console.error("GetWhere Error:", error);
      return null;
    }
  }
  
}
