import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailerService {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
    }

    async sendEmail(
        to: string,
        subject: string,
        html: string,
    ): Promise<void> {
        await sgMail.send({
            to,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL || 'noreply@vitared.com',
                name: 'VitaRed',
            },
            subject,
            html,
        });
    }

    loadTemplate(html: string): string {
        const templatePath = path.join(__dirname, 'templates', html)
        return fs.readFileSync(templatePath, 'utf8')
    }

    async sendWelcomeEmail(email: string, first_name: string): Promise<void> {
        let html = this.loadTemplate('welcome.html')
        html = html.replace('{{name}}', first_name)
        const subject = 'Bienvenido a VitaRed';
        await this.sendEmail(email, subject, html)
    }
}
