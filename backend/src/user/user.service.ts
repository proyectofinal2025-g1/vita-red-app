import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import bcrypt from 'bcrypt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationService } from '../notification/notification.service';
import { UserResponse } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    user: Pick<
      User,
      | 'email'
      | 'password'
      | 'first_name'
      | 'last_name'
      | 'dni'
      | 'profileImageUrl'
    >,
  ) {
    try {
      const userExist = await this.userRepository.findByEmail(user.email);
      if (userExist) {
        throw new BadRequestException('The email is already in use.');
      }

      if (user.dni) {
        const userExistByDni = await this.userRepository.findByDni(user.dni);
        if (userExistByDni) {
          throw new BadRequestException('The dni is already in use.');
        }
      }

      const userCreate = await this.userRepository.create(user);

      await this.notificationService.sendWelcomeNotification(
        user.email,
        user.first_name,
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      return userCreate;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating user: ' + error.message,
      );
    }
  }

  async findAll() {
    return await this.userRepository.findAll();
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not Found');
    return user;
  }

  async findByName(
    first_name?: string,
    last_name?: string,
  ): Promise<UserResponse[]> {
    const listUsersName = await this.userRepository.findByName(
      first_name,
      last_name,
    );
    if (listUsersName.length === 0)
      throw new NotFoundException('User not Found');

    return listUsersName.map(({ password, ...users }) => users);
  }

  async findByDni(dni: string): Promise<UserResponse> {
    const userFound = await this.userRepository.findByDni(dni);
    if (!userFound) throw new NotFoundException('User not Found');

    const { password, ...userWithoutPassword } = userFound;
    return userWithoutPassword;
  }

  async update(id: string, user: Partial<User>) {
    if (!user || Object.keys(user).length === 0)
      throw new BadRequestException('You cannot pass an empty object');
    const userFound = await this.userRepository.findById(id);
    if (!userFound) throw new NotFoundException('User not found');

    const userUpdate = await this.userRepository.update(id, user);
    return `User ${userFound.first_name} ${userFound.last_name} modified correctly`;
  }

  async disable(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User Not found');
    if (user.is_active === false)
      throw new BadRequestException('the user had already been deleted');
    user.is_active = false;
    return `$User {user.first_name} ${user.last_name} eliminated correctly`;
  }

  async updatePassword(
    id: string,
    dto: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not Found');

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Invalid password');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.updatePassword(user);

    return { message: 'Password successfully updated' };
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const userFound = await this.userRepository.findById(userId);
    if (!userFound) throw new NotFoundException('User not found');
    try {
      if (userFound.profileImagePublicId) {
        await this.cloudinaryService.deleteImage(
          userFound.profileImagePublicId,
        );
      }
      const image = await this.cloudinaryService.uploadImage(file);
      userFound.profileImageUrl = image.secure_url;
      userFound.profileImagePublicId = image.public_id;
      await this.userRepository.update(userId, userFound);
      return userFound;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException('Error updating avatar');
    }
  }
}
