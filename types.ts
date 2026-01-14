
export interface LevelData {
  id: number;
  stars: number;
  isLocked: boolean;
}

export interface Animal {
  name: string;
  arabicName: string;
  image: string;
  soundHint: string; // Used for TTS prompt
}

export interface Question {
  correctAnimal: Animal;
  options: Animal[];
}

export enum GameState {
  MAP = 'MAP',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT'
}
