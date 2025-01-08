import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FaceRecognitionService } from './face-recognition/face-recognition.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Directory to store uploaded images temporarily
    }),
  ],
  controllers: [AppController],
  providers: [AppService, FaceRecognitionService],
})
export class AppModule {}
