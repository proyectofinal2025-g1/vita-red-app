import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailerService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendEmail(
        email: string,
        subject: string,
        html: string,
    ): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: email,
                subject,
                html
            })

        } catch (error) {
            throw new Error(`Error sending email: ${error.message}`)
        }
    }

    loadTemplate(html: string): string {
        const templatePath = path.join(__dirname, 'templates', html)
        return fs.readFileSync(templatePath, 'utf8')
    }

    async sendWelcomeEmail(email: string, first_name: string ): Promise<void> {
        let html = this.loadTemplate('welcome.html')
        html = html.replace('{{name}}', first_name)
        const subject = 'Bienvenido a VitaRed';
        await this.sendEmail(email, subject, html)
    }

    async sendAppointmentCreatedEmail(email: string, first_name: string ): Promise<void> {
        let html = this.loadTemplate('appointment-created.html')
        html = html.replace('{{name}}', first_name)
        const subject = 'Turno creado';
        await this.sendEmail(email, subject, html)
    }

    async sendAppointmentCancelledEmail(email: string, first_name: string ): Promise<void> {
        let html = this.loadTemplate('appointment-cancelled.html')
        html = html.replace('{{name}}', first_name)
        const subject = 'Turno cancelado';
        await this.sendEmail(email, subject, html)
    }
}
