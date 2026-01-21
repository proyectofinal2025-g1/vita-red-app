import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) return true;

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return true;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      console.log('JWT VERIFY ERROR', error.message);
      request.user = undefined;
    }

    return true;
  }
}
