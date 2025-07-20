export class CreateQrtokenDto {
  id?: number; // Opcional, se autogenera
  token: string;
  empleado_id: number;
  creado_en: Date;
  expira_en: Date;
  usado: boolean;
  qrCode: string; // Campo opcional para el QR en base64
}