import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs-node';

export async function loadModels() {
  const MODEL_PATH = 'src/models'; // Directory where pre-trained models are stored
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH); // Face detection
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH); // Landmarks
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH); // Face recognition
}

export { faceapi, tf };
