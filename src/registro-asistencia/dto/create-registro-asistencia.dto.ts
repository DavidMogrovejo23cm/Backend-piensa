export class CreateRegistroAsistenciaDto {
  id: number;
  empleado_id: number;
  fecha: Date;
  hora_entrada: Date;
  hora_salida: Date;
  horas_trabajadas: number;
  salario_calculado: number;
}

