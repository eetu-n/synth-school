import type { ModuleNode } from '$lib/modular/types';

export interface CurriculumModule {
  id: string;
  phase: number;
  title: string;
  href: string;
  allowedTargets?: string[];
}

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'oscillators',
    phase: 1,
    title: 'Oscillators',
    href: '/lessons/oscillators/1-intro'
  },
  {
    id: 'filters',
    phase: 2,
    title: 'Filters',
    href: '/lessons/filters/1-intro'
  },
  {
    id: 'envelopes',
    phase: 3,
    title: 'Envelopes',
    href: '/lessons/envelopes/1-intro'
  },
  {
    id: 'lfos',
    phase: 3,
    title: 'LFOs',
    href: '/lessons/lfo/1-intro'
  },
  {
    id: 'synthQuiz',
    phase: 4,
    title: 'Synth Match',
    href: '/lessons/synthQuiz'
  }
];

export function getCurriculumModuleNodes(): ModuleNode[] {
  return CURRICULUM_MODULES.map((m) => ({
    id: m.id,
    phase: m.phase,
    data: {
      title: m.title,
      href: m.href,
      phase: m.phase,
      allowedTargets: m.allowedTargets
    }
  }));
}
