import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FaceRecognitionService } from './face-recognition/face-recognition.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, unlinkSync } from 'fs';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly faceRecognitionService: FaceRecognitionService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
  async register(
    @UploadedFile() file: Express.Multer.File,
    @Body('username') username: string,
  ) {
    if (!file || !username) {
      throw new BadRequestException('Username and image are required.');
    }

    try {
      await this.faceRecognitionService.registerUser(username, file.path);
      unlinkSync(file.path);
      return { message: `User ${username} registered successfully.` };
    } catch (error) {
      unlinkSync(file.path);
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  @UseInterceptors(FileInterceptor('image'))
  async login(
    @UploadedFile() file: Express.Multer.File,
    @Body('username') username: string,
  ) {
    if (!file || !username) {
      throw new BadRequestException('Username and image are required.');
    }

    try {
      const isMatch = await this.faceRecognitionService.loginUser(
        username,
        file.path,
      );
      unlinkSync(file.path);

      if (!isMatch) {
        throw new BadRequestException('Face authentication failed.');
      }

      return { message: 'Login successful.' };
    } catch (error) {
      if (existsSync(file.path)) {
        unlinkSync(file.path);
      } else {
        console.warn(`File not found: ${file.path}`);
      }
      throw new BadRequestException(error.message);
    }
  }
}
