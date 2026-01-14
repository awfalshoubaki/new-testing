
import { Animal } from './types';

export interface AnimalWithSound extends Animal {
  soundUrl: string;
}

export const ANIMALS: AnimalWithSound[] = [
  { 
    name: 'Lion', 
    arabicName: 'أسد', 
    image: 'https://picsum.photos/seed/lion/400', 
    soundUrl: 'https://www.soundjay.com/nature/sounds/lion-roar-01.mp3',
    soundHint: 'زئير الأسد'
  },
  { 
    name: 'Cat', 
    arabicName: 'قطة', 
    image: 'https://picsum.photos/seed/cat/400', 
    soundUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_73147c23a5.mp3',
    soundHint: 'مواء القطة'
  },
  { 
    name: 'Dog', 
    arabicName: 'كلب', 
    image: 'https://picsum.photos/seed/dog/400', 
    soundUrl: 'https://www.soundjay.com/nature/sounds/dog-bark-1.mp3',
    soundHint: 'نباح الكلب'
  },
  { 
    name: 'Elephant', 
    arabicName: 'فيل', 
    image: 'https://picsum.photos/seed/elephant/400', 
    soundUrl: 'https://www.soundjay.com/nature/sounds/elephant-trumpeting-01.mp3',
    soundHint: 'صوت الفيل'
  },
  { 
    name: 'Bird', 
    arabicName: 'عصفور', 
    image: 'https://picsum.photos/seed/bird/400', 
    soundUrl: 'https://www.soundjay.com/nature/sounds/canary-singing-01.mp3',
    soundHint: 'تغريد العصفور'
  },
  { 
    name: 'Cow', 
    arabicName: 'بقرة', 
    image: 'https://picsum.photos/seed/cow/400', 
    soundUrl: 'https://www.soundjay.com/nature/sounds/cow-moo-1.mp3',
    soundHint: 'خوار البقرة'
  },
  { 
    name: 'Sheep', 
    arabicName: 'خروف', 
    image: 'https://picsum.photos/seed/sheep/400', 
    soundUrl: 'https://www.soundjay.com/nature/sounds/sheep-lamb-1.mp3',
    soundHint: 'ثغاء الخروف'
  },
  { 
    name: 'Monkey', 
    arabicName: 'قرد', 
    image: 'https://picsum.photos/seed/monkey/400', 
    soundUrl: 'https://www.soundjay.com/nature/sounds/monkey-chatter-1.mp3',
    soundHint: 'ضحك القرد'
  },
  { 
    name: 'Duck', 
    arabicName: 'بطة', 
    image: 'https://picsum.photos/seed/duck/400', 
    soundUrl: 'https://www.soundjay.com/nature/sounds/duck-quack-1.mp3',
    soundHint: 'بطبطة البطة'
  },
  { 
    name: 'Horse', 
    arabicName: 'حصان', 
    image: 'https://picsum.photos/seed/horse/400', 
    soundUrl: 'https://www.soundjay.com/nature/sounds/horse-neigh-1.mp3',
    soundHint: 'صهيل الحصان'
  },
  { 
    name: 'Rooster', 
    arabicName: 'ديك', 
    image: 'https://picsum.photos/seed/rooster/400', 
    soundUrl: 'https://www.soundjay.com/nature/sounds/rooster-crowing-1.mp3',
    soundHint: 'صياح الديك'
  },
  { 
    name: 'Snake', 
    arabicName: 'ثعبان', 
    image: 'https://picsum.photos/seed/snake/400', 
    soundUrl: 'https://www.soundjay.com/nature/sounds/snake-hiss-1.mp3',
    soundHint: 'فحيح الثعبان'
  },
];

export const TOTAL_LEVELS = 6;
export const QUESTIONS_PER_LEVEL = 10;
