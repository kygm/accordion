import { tone } from './data.js'

export const bassKeyMap = {
  1: { row: 1, column: 1 },
  2: { row: 1, column: 2 },
  3: { row: 2, column: 1 },
  4: { row: 2, column: 2 },
  5: { row: 1, column: 3 },
  6: { row: 1, column: 4 },
  7: { row: 2, column: 3 },
  8: { row: 2, column: 4 },
  9: { row: 1, column: 5 },
  0: { row: 1, column: 6 },
  '-': { row: 2, column: 5 },
  '=': { row: 2, column: 6 },
}

const NOTE_ORDER = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
const NOTE_LABELS = {
  C: 'C',
  Db: 'D♭',
  D: 'D',
  Eb: 'E♭',
  E: 'E',
  F: 'F',
  Gb: 'F♯',
  G: 'G',
  Ab: 'A♭',
  A: 'A',
  Bb: 'B♭',
  B: 'B',
}
const DISPLAY_TO_NOTE_KEY = {
  C: 'C',
  Db: 'Db',
  'D♭': 'Db',
  D: 'D',
  Eb: 'Eb',
  'E♭': 'Eb',
  E: 'E',
  F: 'F',
  'F#': 'Gb',
  'F♯': 'Gb',
  Gb: 'Gb',
  'G♭': 'Gb',
  G: 'G',
  Ab: 'Ab',
  'A♭': 'Ab',
  A: 'A',
  Bb: 'Bb',
  'B♭': 'Bb',
  B: 'B',
}


const TUNING_SHIFTS = {
  FBE: 0,
  GCF: 2,
  EAD: -1,
}

function normalizeIndex(index) {
  return ((index % NOTE_ORDER.length) + NOTE_ORDER.length) % NOTE_ORDER.length
}

function transposeNoteKey(noteKey, semitones) {
  const index = NOTE_ORDER.indexOf(noteKey)
  if (index < 0) {
    throw new Error(`Unknown note key: ${noteKey}`)
  }

  return NOTE_ORDER[normalizeIndex(index + semitones)]
}

function transposeToneValue(value, semitones) {
  return Number((value * Math.pow(2, semitones / 12)).toFixed(6))
}

function parseDisplayNote(noteName) {
  const noteKey = DISPLAY_TO_NOTE_KEY[noteName]
  if (!noteKey) {
    throw new Error(`Unknown display note: ${noteName}`)
  }

  return noteKey
}

function transposeDisplayNote(noteName, semitones, preferLowercase = false) {
  const isLowercase = noteName === noteName.toLowerCase()
  const normalized = parseDisplayNote(noteName[0].toUpperCase() + noteName.slice(1))
  const transposed = transposeNoteKey(normalized, semitones)
  const display = NOTE_LABELS[transposed]

  if (preferLowercase || isLowercase) {
    return display.toLowerCase()
  }

  return display
}

function transposeButton(button, semitones) {
  return {
    ...button,
    name: transposeDisplayNote(button.name, semitones),
    frequency: Array.isArray(button.frequency)
      ? button.frequency.map((hz) => transposeToneValue(hz, semitones))
      : transposeToneValue(button.frequency, semitones),
  }
}

const one = [
  // Pull
  { id: '1-1-pull', name: 'D♭', frequency: tone.Db[4] },
  { id: '1-2-pull', name: 'G', frequency: tone.G[3] },
  { id: '1-3-pull', name: 'B♭', frequency: tone.Bb[3] },
  { id: '1-4-pull', name: 'D', frequency: tone.D[4] },
  { id: '1-5-pull', name: 'E', frequency: tone.E[4] },
  { id: '1-6-pull', name: 'G', frequency: tone.G[4] },
  { id: '1-7-pull', name: 'B♭', frequency: tone.Bb[4] },
  { id: '1-8-pull', name: 'D', frequency: tone.D[5] },
  { id: '1-9-pull', name: 'E', frequency: tone.E[5] },
  { id: '1-10-pull', name: 'G', frequency: tone.G[5] },
  // Push
  { id: '1-1-push', name: 'B', frequency: tone.B[3] },
  { id: '1-2-push', name: 'F', frequency: tone.F[3] },
  { id: '1-3-push', name: 'A', frequency: tone.A[3] },
  { id: '1-4-push', name: 'C', frequency: tone.C[4] },
  { id: '1-5-push', name: 'F', frequency: tone.F[4] },
  { id: '1-6-push', name: 'A', frequency: tone.A[4] },
  { id: '1-7-push', name: 'C', frequency: tone.C[5] },
  { id: '1-8-push', name: 'F', frequency: tone.F[5] },
  { id: '1-9-push', name: 'A', frequency: tone.A[5] },
  { id: '1-10-push', name: 'C', frequency: tone.C[6] },
]

const two = [
  // Pull
  { id: '2-1-pull', name: 'F♯', frequency: tone.Gb[4] },
  { id: '2-2-pull', name: 'A', frequency: tone.A[3] },
  { id: '2-3-pull', name: 'C', frequency: tone.C[4] },
  { id: '2-4-pull', name: 'E♭', frequency: tone.Eb[4] },
  { id: '2-5-pull', name: 'G', frequency: tone.G[4] },
  { id: '2-6-pull', name: 'A', frequency: tone.A[4] },
  { id: '2-7-pull', name: 'C', frequency: tone.C[5] },
  { id: '2-8-pull', name: 'E♭', frequency: tone.Eb[5] },
  { id: '2-9-pull', name: 'G', frequency: tone.G[5] },
  { id: '2-10-pull', name: 'A', frequency: tone.A[5] },
  { id: '2-11-pull', name: 'C', frequency: tone.C[6] },
  // Push
  { id: '2-1-push', name: 'E', frequency: tone.E[4] },
  { id: '2-2-push', name: 'F', frequency: tone.F[3] },
  { id: '2-3-push', name: 'B♭', frequency: tone.Bb[3] },
  { id: '2-4-push', name: 'D', frequency: tone.D[4] },
  { id: '2-5-push', name: 'F', frequency: tone.F[4] },
  { id: '2-6-push', name: 'B♭', frequency: tone.Bb[4] },
  { id: '2-7-push', name: 'D', frequency: tone.D[5] },
  { id: '2-8-push', name: 'F', frequency: tone.F[5] },
  { id: '2-9-push', name: 'B♭', frequency: tone.Bb[5] },
  { id: '2-10-push', name: 'D', frequency: tone.D[6] },
  { id: '2-11-push', name: 'F', frequency: tone.F[6] },
]

const three = [
  // Pull
  { id: '3-1-pull', name: 'B', frequency: tone.B[4] },
  { id: '3-2-pull', name: 'D', frequency: tone.D[4] },
  { id: '3-3-pull', name: 'F', frequency: tone.F[4] },
  { id: '3-4-pull', name: 'A♭', frequency: tone.Ab[4] },
  { id: '3-5-pull', name: 'C', frequency: tone.C[5] },
  { id: '3-6-pull', name: 'D', frequency: tone.D[5] },
  { id: '3-7-pull', name: 'F', frequency: tone.F[5] },
  { id: '3-8-pull', name: 'A♭', frequency: tone.Ab[5] },
  { id: '3-9-pull', name: 'C', frequency: tone.C[6] },
  { id: '3-10-pull', name: 'D', frequency: tone.D[6] },
  // Push
  { id: '3-1-push', name: 'D♭', frequency: tone.Db[4] },
  { id: '3-2-push', name: 'B♭', frequency: tone.Bb[3] },
  { id: '3-3-push', name: 'E♭', frequency: tone.Eb[4] },
  { id: '3-4-push', name: 'G', frequency: tone.G[4] },
  { id: '3-5-push', name: 'B♭', frequency: tone.Bb[4] },
  { id: '3-6-push', name: 'E♭', frequency: tone.Eb[5] },
  { id: '3-7-push', name: 'G', frequency: tone.G[5] },
  { id: '3-8-push', name: 'B♭', frequency: tone.Bb[5] },
  { id: '3-9-push', name: 'E♭', frequency: tone.Eb[6] },
  { id: '3-10-push', name: 'G', frequency: tone.G[6] },
]

const bassLayoutBase = {
  one: [
    { id: '1-1-pull-bass', name: 'gm', frequency: [tone.G[3], tone.Bb[4], tone.D[4]] },
    { id: '1-2-pull-bass', name: 'G', frequency: tone.G[2] },
    { id: '1-1-push-bass', name: 'd', frequency: [tone.D[3], tone.Gb[4], tone.A[4]] },
    { id: '1-2-push-bass', name: 'D', frequency: tone.D[3] },

    { id: '1-3-pull-bass', name: 'cm', frequency: [tone.C[3], tone.Eb[4], tone.G[4]] },
    { id: '1-4-pull-bass', name: 'C', frequency: tone.C[3] },
    { id: '1-3-push-bass', name: 'g', frequency: [tone.C[3], tone.E[4], tone.G[4]] },
    { id: '1-4-push-bass', name: 'G', frequency: tone.G[2] },

    { id: '1-5-pull-bass', name: 'ab', frequency: [tone.Ab[3], tone.C[4], tone.Eb[4]] },
    { id: '1-6-pull-bass', name: 'A♭', frequency: tone.Ab[3] },
    { id: '1-5-push-bass', name: 'ab', frequency: [tone.Ab[3], tone.C[4], tone.Eb[4]] },
    { id: '1-6-push-bass', name: 'A♭', frequency: tone.Ab[3] },
  ],
  two: [
    { id: '2-1-pull-bass', name: 'c', frequency: [tone.C[3], tone.E[4], tone.G[4]] },
    { id: '2-2-pull-bass', name: 'C', frequency: tone.C[3] },
    { id: '2-1-push-bass', name: 'f', frequency: [tone.F[3], tone.A[4], tone.C[4]] },
    { id: '2-2-push-bass', name: 'F', frequency: tone.F[3] },

    { id: '2-3-pull-bass', name: 'f', frequency: [tone.F[3], tone.A[4], tone.C[4]] },
    { id: '2-4-pull-bass', name: 'F', frequency: tone.F[3] },
    { id: '2-3-push-bass', name: 'b♭', frequency: [tone.Bb[3], tone.D[4], tone.F[4]] },
    { id: '2-4-push-bass', name: 'B♭', frequency: tone.Bb[3] },

    { id: '2-5-pull-bass', name: 'b♭', frequency: [tone.Bb[3], tone.D[4], tone.F[4]] },
    { id: '2-6-pull-bass', name: 'B♭', frequency: tone.Bb[3] },
    { id: '2-5-push-bass', name: 'e♭', frequency: [tone.Eb[3], tone.G[4], tone.Bb[4]] },
    { id: '2-6-push-bass', name: 'E♭', frequency: tone.Eb[3] },
  ],
}

const baseLayout = { one, two, three }

function buildTuningLayout(semitones) {
  return Object.fromEntries(
    Object.entries(baseLayout).map(([row, buttons]) => [
      row,
      buttons.map((button) => transposeButton(button, semitones)),
    ])
  )
}

function buildTuningBassLayout(semitones) {
  return Object.fromEntries(
    Object.entries(bassLayoutBase).map(([row, buttons]) => [
      row,
      buttons.map((button) => ({
        ...button,
        name: button.name.endsWith('m')
          ? `${transposeDisplayNote(button.name.slice(0, -1), semitones, true)}m`
          : transposeDisplayNote(button.name, semitones),
        frequency: Array.isArray(button.frequency)
          ? button.frequency.map((hz) => transposeToneValue(hz, semitones))
          : transposeToneValue(button.frequency, semitones),
      })),
    ])
  )
}

function createButtonIdMap(layout, bassLayout) {
  return [...Object.values(layout).flat(), ...Object.values(bassLayout).flat()].reduce((acc, value) => {
    acc[value.id] = value
    return acc
  }, {})
}

const tuningScaleLabels = {
  FBE: ['F', 'Bb', 'Eb'],
  GCF: ['G', 'C', 'F'],
  EAD: ['E', 'A', 'D'],
}

function buildScaleSet(scaleLabels) {
  return scaleLabels.map((label, index) => ({
    key: label,
    label: `${label} Major`,
    row: Object.keys(baseLayout)[index],
  }))
}

export const tuningLayouts = Object.fromEntries(
  Object.entries(TUNING_SHIFTS).map(([tuning, semitones]) => {
    const layout = buildTuningLayout(semitones)
    const bassLayout = buildTuningBassLayout(semitones)

    return [
      tuning,
      {
        layout,
        bassLayout,
        buttonIdMap: createButtonIdMap(layout, bassLayout),
        scales: buildScaleSet(tuningScaleLabels[tuning]),
      },
    ]
  })
)

export const rowMap = { 1: 'one', 2: 'two', 3: 'three' }
export const bassRowMap = { 1: 'one', 2: 'two' }
export const rowTones = {
  FBE: { one: 'F', two: 'B♭', three: 'E♭' },
  GCF: { one: 'G', two: 'C', three: 'F' },
  EAD: { one: 'E', two: 'A', three: 'D' },
}
export const rows = Object.values(rowMap)
export const bassRows = Object.values(bassRowMap)
export const toggleBellows = 'q'
