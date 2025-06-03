import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        let message: string = exception.message;
        let errors: any[] | null = null;

        if (exception instanceof BadRequestException) {
            const responseObj = exception.getResponse();
            if (typeof responseObj === 'object' && responseObj !== null) {
                if ('message' in responseObj && typeof responseObj.message === 'string') {
                    message = responseObj.message || 'Validation failed';
                }
                if ('errors' in responseObj && Array.isArray(responseObj.errors)) {
                    errors = responseObj.errors.map((error: any) => ({
                        field: error.property,
                        message: error.message || Object.values(error.constraints || {}).join(', '),
                    }));
                }
            }
        }

        response.status(status).json({
            message,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            ...(errors && { errors }),
        });
    }
}
