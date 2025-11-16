import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { UsersEntity } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalStatus } from 'src/globals/enums/global-status.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateSellerDto, CreateUserDto } from '../auth/dto/create-user.dto';
import { SellersEntity } from '../sellers/sellers.entity';
import { SellersService } from '../sellers/sellers.service';
import { RolesService } from '../roles/roles.service';
import { AuthService } from '../auth/auth.service';
type MulterFile = Express.Multer.File;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly sellersService: SellersService,
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}


  async createUser(createUserDto: CreateUserDto) {
    const user = await this.getByEmail(createUserDto.email);
    if (user) {
      throw new ConflictException('El email ya está registrado');
    }

    const phoneIsRegistered = await this.getPhoneIsRegistered(createUserDto.phone);
    if (phoneIsRegistered) {
      throw new ConflictException('El teléfono ya está registrado');
    }

    const numDocumentIsRegistered = await this.isNumDocumentIsRegistered(createUserDto.num_document);
    if (numDocumentIsRegistered) {
      throw new ConflictException('El número de documento ya está registrado');
    }

    const hashedPassword = await this.authService.hashPassword(createUserDto.password);
    const role = await this.rolesService.getRoleByName('buyer');
    const newUser = this.usersRepository.create({ ...createUserDto, password: hashedPassword, role_id: role.id });
    await this.usersRepository.save(newUser);
    
    const userWithRelations = await this.usersRepository.findOne({ 
      where: { id: newUser.id }, 
      relations: ['role'] 
    });

    return this.authService.generateTokenResponse(userWithRelations!);
  }

  async createSeller(createSellerDto: CreateSellerDto, logoFile?: MulterFile) {
    const user = await this.getByEmail(createSellerDto.email);
    if (user) {
      throw new ConflictException('El email ya está registrado');
    }
    const phoneIsRegistered = await this.getPhoneIsRegistered(createSellerDto.phone);
    if (phoneIsRegistered) {
      throw new ConflictException('El teléfono ya está registrado');
    }
    const numDocumentIsRegistered = await this.isNumDocumentIsRegistered(createSellerDto.num_document);
    if (numDocumentIsRegistered) {
      throw new ConflictException('El número de documento ya está registrado');
    }
    const hashedPassword = await this.authService.hashPassword(createSellerDto.password);
    const role = await this.rolesService.getRoleByName('seller');
    const newUser = this.usersRepository.create({ ...createSellerDto, password: hashedPassword, role_id: role.id });
    await this.usersRepository.save(newUser);

    await this.sellersService.createSeller(createSellerDto, newUser.id, logoFile);
    
    const userWithRelations = await this.usersRepository.findOne({ 
      where: { id: newUser.id }, 
      relations: ['role'] 
    });
    
    return this.authService.generateTokenResponse(userWithRelations!);
  }

  async getByEmail(email: string): Promise<UsersEntity | null> {
    return this.usersRepository.findOne({ where: { email, status: GlobalStatus.ACTIVE }, relations: ['role'] });
  }

  async getByIdAndActive(id: string): Promise<UsersEntity> {
    const user = await this.usersRepository.findOne({ where: { id, status: GlobalStatus.ACTIVE } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado o inactivo');
    }
    return user;
  }

  async getById(id: string): Promise<UsersEntity> {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['role'] });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UsersEntity> {
    await this.getById(id);
    await this.usersRepository.update(id, updateUserDto);
    return this.getById(id);
  }

  async getPhoneIsRegistered(phone: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { phone, status: GlobalStatus.ACTIVE } });
    if (!user) {
      return false;
    }
    return true;
  }

  async isNumDocumentIsRegistered(numDocument: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { num_document: numDocument, status: GlobalStatus.ACTIVE } });
    if (user) {
      return true;
    }
    return false;
  }

}
