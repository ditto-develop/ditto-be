import multer, { DiskStorageOptions, MulterError } from 'multer';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { extname, join } from 'path';
import e, { Request, Response } from 'express';
import { NanoId } from '../value-objects/nanoid.vo';
import { Observable } from 'rxjs';
import { isArray, isRecord, isString } from '../typeguards/common.type-guard';
import { UploadedFileVo } from '../value-objects/uploaded-file.vo';
import { existsSync } from 'node:fs';
import { mkdirSync } from 'fs';

export interface FileUploadOptions {
  fieldName: string;
  dest?: string;
  maxCount?: number;
  allowedMimeTypes?: string[];
  storageConfig?: DiskStorageOptions;
}

@Injectable()
export class UploadInterceptor implements NestInterceptor {
  private readonly uploadMiddleware: multer.Multer;
  private readonly dest: string;

  constructor(private readonly options: FileUploadOptions) {
    this.dest = options.dest ?? join(process.cwd(), 'public', 'images');

    if (!existsSync(this.dest)) {
      mkdirSync(this.dest, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: this.dest,
      filename: (
        req: e.Request,
        file: Express.Multer.File,
        callback: (error: Error | null, filename: string) => void,
      ) => {
        const timestamp = Date.now();
        const id = NanoId.create().toString();
        const uniqueSuffix = `${timestamp}-${id}`;
        const ext = extname(file.originalname) || '';
        callback(null, `${uniqueSuffix}${ext}`);
      },
      ...(options.storageConfig ?? {}),
    });

    const fileFilter = (req: e.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
      if (!options.allowedMimeTypes || options.allowedMimeTypes.length === 0) {
        callback(null, true);
        return;
      }
      if (options.allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Unsupported file type') as any, false);
      }
    };

    this.uploadMiddleware = multer({ storage, fileFilter });
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<
      Request & {
        file?: Express.Multer.File;
        files?: Express.Multer.File[];
        uploaded?: UploadedFileVo;
        uploadedFiles?: UploadedFileVo[];
      }
    >();
    const res = ctx.getResponse<Response>();

    const runMulter = (): Promise<void> =>
      new Promise<void>((resolve, reject) => {
        const { fieldName, maxCount } = this.options;
        const handler =
          maxCount && maxCount > 1
            ? this.uploadMiddleware.array(fieldName, maxCount)
            : this.uploadMiddleware.single(fieldName);
        handler(req, res, (err?: unknown) => {
          if (!err) {
            resolve();
            return;
          }

          if (err instanceof Error) {
            if (err instanceof MulterError) {
              reject(new BadRequestException(err.message));
            } else {
              reject(err);
            }
          } else if (isString(err)) {
            reject(new Error(err));
          } else {
            reject(new Error('Unknown error occurred during file upload.'));
          }
        });
      });

    try {
      await runMulter();
    } catch (e) {
      if (e instanceof BadRequestException || e instanceof InternalServerErrorException) {
        throw e;
      }

      if (e instanceof MulterError) {
        throw new BadRequestException(e.message);
      }

      if (e instanceof Error) {
        throw new InternalServerErrorException(e.message);
      }
      throw new InternalServerErrorException('File upload failed');
    }

    if (isRecord(req.file)) {
      req.uploaded = UploadedFileVo.fromMulterFile(req.file);
    } else if (isArray(req.files)) {
      req.uploadedFiles = req.files.map((file) => UploadedFileVo.fromMulterFile(file));
    }

    return next.handle();
  }
}
