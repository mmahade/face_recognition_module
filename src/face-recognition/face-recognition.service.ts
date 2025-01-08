import { Injectable, OnModuleInit } from '@nestjs/common';
import { faceapi, loadModels } from '../face-api-config';
import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';

@Injectable()
export class FaceRecognitionService implements OnModuleInit {
  private storedDescriptors: Map<string, Float32Array> = new Map();
  async onModuleInit() {
    await loadModels();
  }

  private async loadImageAsTensor(imagePath: string): Promise<tf.Tensor3D> {
    const imageBuffer = fs.readFileSync(imagePath);
    const decodedImage = tf.node.decodeImage(imageBuffer, 3); // 3 channels (RGB)
    return decodedImage as tf.Tensor3D;
  }

  async detectFace(imagePath: string): Promise<any> {
    const imageTensor = await this.loadImageAsTensor(imagePath);

    try {
      const batchedTensor = tf.expandDims(imageTensor, 0);
      const detection = await faceapi
        .detectSingleFace(batchedTensor as any)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error('No face detected.');
      }

      return detection;
    } finally {
      imageTensor.dispose();
    }
  }

  async compareFaces(
    descriptor1: Float32Array,
    descriptor2: Float32Array,
  ): Promise<boolean> {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    return distance < 0.6;
  }

  async registerUser(username: string, imagePath: string): Promise<void> {
    const detection = await this.detectFace(imagePath);

    console.log(detection);

    if (!detection || !detection.descriptor) {
      throw new Error('No face detected during registration.');
    }

    this.storedDescriptors.set(username, detection.descriptor);
  }

  async loginUser(username: string, imagePath: string): Promise<boolean> {
    const storedDescriptor = this.storedDescriptors.get(username);
    if (!storedDescriptor) {
      throw new Error('User not found.');
    }

    const detection = await this.detectFace(imagePath);
    return this.compareFaces(storedDescriptor, detection.descriptor);
  }
}
