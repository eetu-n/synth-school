import type { ModuleNode } from '$lib/modular/types';

export interface CurriculumModule {
  id: string;
  phase: number;
  title: string;
  description: string;
  href: string;
  allowedTargets?: string[];
}

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'oscillators',
    phase: 1,
    title: 'Oscillators',
    description: 'Learn about the parts of a synthesizer that create the sound',
    href: '/lessons/oscillators/1-intro'
  },
  {
    id: 'filters',
    phase: 2,
    title: 'Filters',
    description: 'Learn how to affect the sound created from an oscillator',
    href: '/lessons/filters/1-intro'
  },
  {
    id: 'envelopes',
    phase: 3,
    title: 'Envelopes',
    description: 'A type of automation that ',
    href: '/lessons/envelopes/1-intro'
  },
  {
    id: 'lfos',
    phase: 3,
    title: 'LFOs',
    description: 'TODO',
    href: '/lessons/lfo/1-intro'
  },
  {
    id: 'synthQuiz',
    phase: 4,
    title: 'Synth Match',
    description: 'TODO',
    href: '/lessons/synthQuiz'
  }
];

export function getCurriculumModuleNodes(): ModuleNode[] {
  return CURRICULUM_MODULES.map((m) => ({
    id: m.id,
    phase: m.phase,
    data: {
      title: m.title,
      description: m.description,
      href: m.href,
      allowedTargets: m.allowedTargets
    }
  }));
}
