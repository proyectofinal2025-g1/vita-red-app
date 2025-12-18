import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwstService: JwtService) { }
    async canActivate(context: ExecutionContext): Promise<boolean>  {
        const request = context.switchToHttp().getRequest()
        const authHeader = request.headers['authorization']
        if (!authHeader) throw new UnauthorizedException('Authorization header missing')

        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid authorization format');
        }

        try {
            const payload = await this.jwstService.verifyAsync(token)
            request.user = payload
            return true
        } catch (error) {
            throw new UnauthorizedException('Token invalid');
        }
    }
}