export class CreateRegistroAsistenciaDto {
  id?: number; // Opcional, se autogenera
  empleado_id: number;
  fecha: Date;
  hora_entrada?: Date; // Opcional para permitir registros parciales
  hora_salida?: Date; // Opcional para permitir registros parciales
  horas_trabajadas: number;
  salario_calculado: number;
}