import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { RolesEnum } from "../../user/enums/roles.enum";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest()
        const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>('roles', [context.getHandler(), context.getClass()])
        const user = request.user;
        const hasRole = () => requiredRoles.some(role => user?.role?.includes(role))
        const valid = user && user.role && hasRole()
        console.log('requiredRoles:', requiredRoles);
console.log('user.role:', user.role);

        if (!valid)
            throw new ForbiddenException(
                'Usted no tiene permisos para ingresar a esta ruta',
            );
        return true;
    }
}