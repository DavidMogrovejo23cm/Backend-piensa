export class CreateQrtokenDto {
  id: number;
  token: string;
  empleado_id: number;
  creado_en: Date;
  expira_en: Date;
  usado: boolean;
}

