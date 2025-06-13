-- CreateTable
CREATE TABLE "Jefe" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,

    CONSTRAINT "Jefe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "salario_hora" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "jefe_id" INTEGER NOT NULL,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "empleado_id" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL,

    CONSTRAINT "QRToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroAsistencia" (
    "id" SERIAL NOT NULL,
    "empleado_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora_entrada" TIMESTAMP(3) NOT NULL,
    "hora_salida" TIMESTAMP(3) NOT NULL,
    "horas_trabajadas" DOUBLE PRECISION NOT NULL,
    "salario_calculado" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RegistroAsistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" SERIAL NOT NULL,
    "jefe_id" INTEGER NOT NULL,
    "fecha_generacion" TIMESTAMP(3) NOT NULL,
    "periodo_inicio" TIMESTAMP(3) NOT NULL,
    "periodo_fin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleReporte" (
    "id" SERIAL NOT NULL,
    "reporte_id" INTEGER NOT NULL,
    "empleado_id" INTEGER NOT NULL,
    "total_horas" DOUBLE PRECISION NOT NULL,
    "total_pagado" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DetalleReporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QRToken_token_key" ON "QRToken"("token");
