import { Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';

@Injectable()
export class FfmpegService {
  constructor() {
    ffmpeg.setFfmpegPath(ffmpegStatic!);
  }

  extractAudio() {
    const inputFile = path.join(__dirname, '../../data/video.mov');
    const outputFile = path.join(__dirname, '../../data/audio.mp3');

    ffmpeg()
      .input(inputFile)
      .outputOptions('-ab', '192k')
      .saveToFile(outputFile)
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${Math.floor(progress.percent)}% done`);
        }
      })
      .on('end', () => {
        console.log('FFmpeg has finished');
      })
      .on('error', (error) => {
        console.log(error);
      });
  }

  extractImages() {
    const inputFile = path.join(__dirname, '../../data/video.mov');
    const outputFile = path.join(__dirname, '../../data/images/frame-%03d.png');

    ffmpeg()
      .input(inputFile)
      .fps(10)
      .saveToFile(outputFile)
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${Math.floor(progress.percent)}% done`);
        }
      })
      .on('end', () => {
        console.log('FFmpeg has finished');
      })
      .on('error', (error) => {
        console.log(error);
      });
  }

  audioDenoise() {
    const inputFile = path.join(__dirname, '../../data/noise_rec.m4a');
    const outputFile = path.join(__dirname, '../../data/denoise-video.wav');
    const filters = 'afftdn=nr=20:nf=-30:tn=1';

    ffmpeg()
      .input(inputFile)
      .audioFilters(filters)
      .saveToFile(outputFile)
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${Math.floor(progress.percent)}% done`);
        }
      })
      .on('end', () => {
        console.log('FFmpeg has finished');
      })
      .on('error', (error) => {
        console.log(error);
      });
  }
}
