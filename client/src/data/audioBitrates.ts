const DEFAULT_BITRATES = [64, 96, 128, 160, 192, 256, 320];

const BITRATE_PRESETS: Record<string, number[]> = {
  mp3: [32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  mp2: [32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
  mp4: [64, 96, 128, 160, 192, 256, 320],
  aac: [64, 96, 128, 160, 192, 256, 320],
  m4a: [64, 96, 128, 160, 192, 256, 320],
  ogg: [64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  opus: [48, 64, 80, 96, 112, 128, 160, 192, 256],
  wav: [],
  flac: [],
  alac: [],
  aiff: [],
  aif: [],
  wma: [48, 64, 96, 128, 160, 192, 256, 320],
  amr: [12, 20, 23, 32, 40, 48],
  ac3: [96, 128, 160, 192, 224, 256, 320, 384, 448, 512, 576, 640],
  dts: [256, 320, 384, 448, 512, 640, 768, 896, 1024, 1152, 1280, 1536],
  spx: [8, 12, 16, 24, 32, 40, 48],
  ogv: [64, 96, 128, 160, 192, 256, 320],
  mpga: [64, 96, 128, 160, 192, 224, 256, 320],
};

const LOSSLESS_FORMATS = new Set(['wav', 'flac', 'alac', 'aiff', 'aif']);

function formatBitrate(value: number) {
  return `${value}k`;
}

export function getAudioBitrateOptions(format?: string | null) {
  if (!format) {
    return DEFAULT_BITRATES.map(formatBitrate);
  }

  const normalizedFormat = format.toLowerCase();

  if (LOSSLESS_FORMATS.has(normalizedFormat)) {
    return [];
  }

  const preset = BITRATE_PRESETS[normalizedFormat] ?? DEFAULT_BITRATES;
  return preset.map(formatBitrate);
}

export function isLosslessAudioFormat(format?: string | null) {
  if (!format) return false;
  return LOSSLESS_FORMATS.has(format.toLowerCase());
}
