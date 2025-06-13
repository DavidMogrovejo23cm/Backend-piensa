export class CreateEmpleadoDto {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  salario_hora: number;
  activo: boolean;
  jefe_id: number;
}
