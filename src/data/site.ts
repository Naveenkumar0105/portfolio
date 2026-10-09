import { projects } from './projects'
import { experience } from './experience'

export const site = {
  name: 'Naveenkumar Narsozhan',
  email: 'narsozha@usc.edu',
  phoneDisplay: '(213) 796-2976',
  phoneHref: 'tel:+12137962976',
  linkedin: 'https://linkedin.com/in/naveenkumar-narsozhan',
  github: 'https://github.com/Naveenkumar0105',
  heroLabel: 'Software engineer / applied AI',
  heroFirst: 'I build intelligent systems',
  heroSecond: 'that work in the real world.',
  heroDescription: 'MS CS @ USC · AI, NLP, agentic systems & RAG · Available for full-time roles from May 2027.',
  workIntro: 'Selected systems, research, and experiments.',
  contactHeadline: "Let's talk.",
  contactDescription: 'Open to full-time SWE, ML, and applied AI roles from May 2027.',
  location: 'Los Angeles, CA',
  quote: '“The most powerful magic is understanding.”',
  dossier: {
    label: 'Quick Dossier',
    headline: 'Snitch caught. +150 points to your House.',
    graduation: 'MS CS @ USC · graduating May 2027',
    seeking: 'Seeking 2027 full-time SWE / ML / applied-AI roles · Los Angeles, CA',
    highlightsLabel: 'Three things worth 30 seconds',
    resume: 'Download Resume Scroll',
    mailSubject: 'Hello Naveen, saw your portfolio',
    keepExploring: 'Keep exploring',
    rest: 'Put Snitch to Rest',
    toast: '+150 again',
    open: 'Open dossier',
  },
}

export const dossierHighlights = [projects[0].dossier!, experience[0].dossier!, projects[2].dossier!]
