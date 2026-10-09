import assert from 'node:assert/strict'
import { projects } from '../src/data/projects.ts'
import { experience } from '../src/data/experience.ts'

assert.equal(projects.length, 6)
assert.match(projects[0].outcome, /36,800.*54%.*\+6\.97 pp mAP@0\.5/)
assert.equal(projects[1].url, 'https://github.com/Naveenkumar0105/kuri-ai')
assert.equal(projects[4].url, 'https://github.com/Naveenkumar0105/Image-to-Image-translation-GAN-')
assert(projects.filter(project => project.url).every(project => project.url !== 'https://github.com/Naveenkumar0105'))
assert.deepEqual([projects[0].dossier?.stat, experience[0].dossier?.stat, projects[2].dossier?.stat], ['54%', '500+', '★'])
assert.deepEqual([projects[0].dossier?.section, experience[0].dossier?.section, projects[2].dossier?.section], ['work', 'experience', 'work'])
