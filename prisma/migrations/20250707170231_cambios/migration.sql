-- AlterTable
ALTER TABLE "Empleado" ADD COLUMN     "empleadoRolId" INTEGER;

-- AlterTable
ALTER TABLE "Jefe" ADD COLUMN     "jefeRolId" INTEGER;

-- AlterTable
ALTER TABLE "QRToken" ADD COLUMN     "qrCode" TEXT;

-- CreateTable
CREATE TABLE "EmpleadoRol" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "EmpleadoRol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JefeRol" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "JefeRol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpleadoSpeaker" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "speakerId" INTEGER NOT NULL,

    CONSTRAINT "EmpleadoSpeaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JefeSpeaker" (
    "id" SERIAL NOT NULL,
    "jefeId" INTEGER NOT NULL,
    "speakerId" INTEGER NOT NULL,

    CONSTRAINT "JefeSpeaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Speaker" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Speaker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmpleadoRol_name_key" ON "EmpleadoRol"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JefeRol_name_key" ON "JefeRol"("name");

-- AddForeignKey
ALTER TABLE "Jefe" ADD CONSTRAINT "Jefe_jefeRolId_fkey" FOREIGN KEY ("jefeRolId") REFERENCES "JefeRol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_empleadoRolId_fkey" FOREIGN KEY ("empleadoRolId") REFERENCES "EmpleadoRol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRToken" ADD CONSTRAINT "QRToken_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAsistencia" ADD CONSTRAINT "RegistroAsistencia_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_jefe_id_fkey" FOREIGN KEY ("jefe_id") REFERENCES "Jefe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleReporte" ADD CONSTRAINT "DetalleReporte_reporte_id_fkey" FOREIGN KEY ("reporte_id") REFERENCES "Reporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleReporte" ADD CONSTRAINT "DetalleReporte_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpleadoSpeaker" ADD CONSTRAINT "EmpleadoSpeaker_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpleadoSpeaker" ADD CONSTRAINT "EmpleadoSpeaker_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JefeSpeaker" ADD CONSTRAINT "JefeSpeaker_jefeId_fkey" FOREIGN KEY ("jefeId") REFERENCES "Jefe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JefeSpeaker" ADD CONSTRAINT "JefeSpeaker_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
