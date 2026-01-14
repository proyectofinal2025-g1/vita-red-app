import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class OptionalAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader) return true;

        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) return true;

        try {
            const payload = await this.jwtService.verifyAsync(token);
            request.user = { ...payload, id: payload.sub }; 
        } catch {
            request.user = undefined;
        }

        return true;
    }
}
