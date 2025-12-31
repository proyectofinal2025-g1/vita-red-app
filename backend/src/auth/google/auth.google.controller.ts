import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthGoogleController {

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Este método inicia el flujo de Google (redirige al usuario)
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res) {
    // Aquí llega el usuario después de loguearse en Google
    const user = req.user;
    
    // Por ahora, vamos a redirigirlo a tu Front (3001)
    // En el futuro, aquí generarás un JWT o sesión.
    return res.redirect(`http://localhost:3001/dashboard?user=${user.firstName}`);
  }
}