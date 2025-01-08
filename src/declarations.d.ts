// src/declarations.d.ts

import * as Multer from 'multer';

declare global {
  namespace Express {
    export interface Request {
      file: Multer.File;
      files: Multer.File[];
    }
  }
}
