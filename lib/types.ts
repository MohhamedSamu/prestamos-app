export interface NewClient {
  nombre: string;
  domicilio: string;
  numero: string;
  periodo: string;
  tasa_interes: number;
  cantidadPrestamo: number;
}

export interface ClientDocument extends Client {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: any;
}

export interface Client {
  nombre: string;
  domicilio: string;
  numero: string;
  periodo: string;
}

export interface Lending {
  cliente_id: string;
  cantidad: number;
  tasa_interes: number;
  fecha_inicio: string;
  fecha_fin: string | null;
}

export interface LendingDocument extends Lending {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: any;
}

export interface Payment {
  cliente_id: string;
  prestamo_id: string;
  cantidad_interes: number;
  cantidad_capital: number;
  fecha: string;
}

export interface PaymentDocument extends Payment {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: any;
}