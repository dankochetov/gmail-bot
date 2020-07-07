import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import path from 'path';

@Catch(HttpException)
export default class NotFoundExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        res.header('Cache-Control', 'max-age=0');
        res.sendFile(path.resolve('dist', 'ui', 'index.html'));
    }
}
