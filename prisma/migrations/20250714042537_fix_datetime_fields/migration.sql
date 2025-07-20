/*
  Warnings:

  - You are about to drop the column `total_horas` on the `DetalleReporte` table. All the data in the column will be lost.
  - You are about to drop the column `total_pagado` on the `DetalleReporte` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DetalleReporte" DROP CONSTRAINT "DetalleReporte_empleado_id_fkey";

-- AlterTable
ALTER TABLE "DetalleReporte" DROP COLUMN "total_horas",
DROP COLUMN "total_pagado";

-- AlterTable
ALTER TABLE "RegistroAsistencia" ALTER COLUMN "hora_entrada" DROP NOT NULL,
ALTER COLUMN "hora_salida" DROP NOT NULL;
