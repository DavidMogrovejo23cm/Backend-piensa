import { Injectable } from '@nestjs/common';
import { CreateQrtokenDto } from './dto/create-qrtoken.dto';
import { UpdateQrtokenDto } from './dto/update-qrtoken.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QrtokenService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQrtokenDto: CreateQrtokenDto) {
    try {
      // Crear el token en la base de datos
      const qrtoken = await this.prisma.qRToken.create({
        data: {
          token: createQrtokenDto.token,
          empleado_id: createQrtokenDto.empleado_id,
          creado_en: new Date(createQrtokenDto.creado_en),
          expira_en: new Date(createQrtokenDto.expira_en),
          usado: createQrtokenDto.usado,
          qrCode: createQrtokenDto.qrCode, // Ahora guardamos el QR code en la BD
        },
      });

      return {
        success: true,
        message: 'QR Token creado exitosamente',
        data: qrtoken
      };
    } catch (error) {
      throw new Error(`Error al crear QR token: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const qrtokens = await this.prisma.qRToken.findMany({
        orderBy: {
          creado_en: 'desc'
        }
      });
      return {
        success: true,
        data: qrtokens
      };
    } catch (error) {
      throw new Error(`Error al obtener QR tokens: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const qrtoken = await this.prisma.qRToken.findUnique({
        where: { id }
      });
      
      if (!qrtoken) {
        throw new Error('QR Token no encontrado');
      }

      return {
        success: true,
        data: qrtoken
      };
    } catch (error) {
      throw new Error(`Error al obtener QR token: ${error.message}`);
    }
  }

  async findByToken(token: string) {
    try {
      const qrtoken = await this.prisma.qRToken.findFirst({
        where: { token }
      });
      
      return {
        success: true,
        data: qrtoken
      };
    } catch (error) {
      throw new Error(`Error al buscar QR token: ${error.message}`);
    }
  }

  async update(id: number, updateQrtokenDto: UpdateQrtokenDto) {
    try {
      const qrtoken = await this.prisma.qRToken.update({
        where: { id },
        data: {
          ...updateQrtokenDto,
          creado_en: updateQrtokenDto.creado_en ? new Date(updateQrtokenDto.creado_en) : undefined,
          expira_en: updateQrtokenDto.expira_en ? new Date(updateQrtokenDto.expira_en) : undefined,
        },
      });

      return {
        success: true,
        message: 'QR Token actualizado exitosamente',
        data: qrtoken
      };
    } catch (error) {
      throw new Error(`Error al actualizar QR token: ${error.message}`);
    }
  }

  async markAsUsed(id: number) {
    try {
      const qrtoken = await this.prisma.qRToken.update({
        where: { id },
        data: { usado: true },
      });

      return {
        success: true,
        message: 'QR Token marcado como usado',
        data: qrtoken
      };
    } catch (error) {
      throw new Error(`Error al marcar QR token como usado: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.qRToken.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'QR Token eliminado exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al eliminar QR token: ${error.message}`);
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const qrtoken = await this.prisma.qRToken.findFirst({
        where: { token }
      });

      if (!qrtoken) {
        return false;
      }

      // Verificar si ya fue usado
      if (qrtoken.usado) {
        return false;
      }

      // Verificar si expiró
      if (new Date() > qrtoken.expira_en) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}