import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

@Injectable()
export default class ServeUIMiddleware implements NestMiddleware {
    use(req: Request, res: Response, ignoredNext: () => void): void {
        const distFolder = path.join(process.cwd(), 'dist', 'ui');
        const filePath = path.join(distFolder, req.params[0]);
        if (
            !path.relative(distFolder, filePath).includes('..') &&
            fs.existsSync(filePath) &&
            fs.statSync(filePath).isFile()
        ) {
            res.sendFile(filePath);
        } else {
            res.header('Cache-Control', 'max-age=0');
            res.sendFile(path.join(distFolder, 'index.html'));
        }
    }
}
