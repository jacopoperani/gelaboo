import { describe, it, expect } from 'vitest'
import { bilanciaRicetta } from './calculator.js'

describe('bilanciaRicetta — valori verificati a mano', () => {
  it('Fragola — frutta con latte', () => {
    const r = bilanciaRicetta([
      { g_per_kg: 300, zuccheri: 9,   grassi: 0,   slng: 0,   altri: 2,   pod: 90,  pac: 130 },
      { g_per_kg: 500, zuccheri: 5,   grassi: 3.5, slng: 8.7, altri: 0,   pod: 16,  pac: 100 },
      { g_per_kg: 100, zuccheri: 100, grassi: 0,   slng: 0,   altri: 0,   pod: 100, pac: 100 },
      { g_per_kg: 65,  zuccheri: 92,  grassi: 0,   slng: 0,   altri: 0,   pod: 72,  pac: 180 },
      { g_per_kg: 30,  zuccheri: 80,  grassi: 0,   slng: 0,   altri: 0,   pod: 45,  pac: 85  },
      { g_per_kg: 5,   zuccheri: 0,   grassi: 0,   slng: 0,   altri: 100, pod: 0,   pac: 0   },
    ], 1, 'frutta')

    expect(r.zuccheri).toBeCloseTo(23.58, 1)
    expect(r.grassi).toBeCloseTo(1.8, 1)
    expect(r.slng).toBeCloseTo(4.35, 1)
    expect(r.altriSolidi).toBeCloseTo(1.1, 1)
    expect(r.solidiTotali).toBeCloseTo(30.78, 1)
    expect(r.pod).toBeCloseTo(18.22, 1)
    expect(r.pac).toBeCloseTo(28.81, 1)
  })

  it('Limone — sorbetto puro', () => {
    const r = bilanciaRicetta([
      { g_per_kg: 300, zuccheri: 9,   grassi: 0, slng: 0, altri: 2,   pod: 90,  pac: 130 },
      { g_per_kg: 350, zuccheri: 0,   grassi: 0, slng: 0, altri: 0,   pod: 0,   pac: 0   },
      { g_per_kg: 220, zuccheri: 100, grassi: 0, slng: 0, altri: 0,   pod: 100, pac: 100 },
      { g_per_kg: 80,  zuccheri: 92,  grassi: 0, slng: 0, altri: 0,   pod: 72,  pac: 180 },
      { g_per_kg: 40,  zuccheri: 70,  grassi: 0, slng: 0, altri: 0,   pod: 130, pac: 190 },
      { g_per_kg: 5,   zuccheri: 0,   grassi: 0, slng: 0, altri: 100, pod: 0,   pac: 0   },
    ], 1, 'sorbetto')

    expect(r.zuccheri).toBeCloseTo(35.04, 1)
    expect(r.grassi).toBeCloseTo(0, 1)
    expect(r.slng).toBeCloseTo(0, 1)
    expect(r.altriSolidi).toBeCloseTo(1.11, 1)
    expect(r.solidiTotali).toBeCloseTo(36.14, 1)
    expect(r.pod).toBeCloseTo(33.54, 1)
    expect(r.pac).toBeCloseTo(44.30, 1)
  })

  it('Cocco Vegano', () => {
    const r = bilanciaRicetta([
      { g_per_kg: 550, zuccheri: 3,   grassi: 21, slng: 0, altri: 3,   pod: 30,  pac: 30  },
      { g_per_kg: 100, zuccheri: 0,   grassi: 0,  slng: 0, altri: 0,   pod: 0,   pac: 0   },
      { g_per_kg: 180, zuccheri: 100, grassi: 0,  slng: 0, altri: 0,   pod: 100, pac: 100 },
      { g_per_kg: 60,  zuccheri: 92,  grassi: 0,  slng: 0, altri: 0,   pod: 72,  pac: 180 },
      { g_per_kg: 80,  zuccheri: 80,  grassi: 0,  slng: 0, altri: 0,   pod: 45,  pac: 85  },
      { g_per_kg: 25,  zuccheri: 10,  grassi: 0,  slng: 0, altri: 85,  pod: 10,  pac: 25  },
      { g_per_kg: 5,   zuccheri: 0,   grassi: 0,  slng: 0, altri: 100, pod: 0,   pac: 0   },
    ], 1, 'vegano')

    expect(r.zuccheri).toBeCloseTo(31.82, 1)
    expect(r.grassi).toBeCloseTo(11.55, 1)
    expect(r.slng).toBeCloseTo(0, 1)
    expect(r.altriSolidi).toBeCloseTo(4.275, 1)
    expect(r.solidiTotali).toBeCloseTo(47.645, 1)
    expect(r.pod).toBeCloseTo(25.37, 1)
    expect(r.pac).toBeCloseTo(33.93, 1)
  })

  it('Fior di Panna — crema', () => {
    const r = bilanciaRicetta([
      { g_per_kg: 600, zuccheri: 0,   grassi: 3.5, slng: 9,  altri: 0,   pod: 0,   pac: 0   },
      { g_per_kg: 150, zuccheri: 0,   grassi: 35,  slng: 6,  altri: 0,   pod: 0,   pac: 0   },
      { g_per_kg: 160, zuccheri: 100, grassi: 0,   slng: 0,  altri: 0,   pod: 100, pac: 100 },
      { g_per_kg: 50,  zuccheri: 0,   grassi: 1,   slng: 96, altri: 0,   pod: 0,   pac: 0   },
      { g_per_kg: 30,  zuccheri: 80,  grassi: 0,   slng: 0,  altri: 0,   pod: 45,  pac: 85  },
      { g_per_kg: 8,   zuccheri: 0,   grassi: 0,   slng: 0,  altri: 100, pod: 0,   pac: 0   },
    ], 1, 'crema')

    expect(r.zuccheri).toBeCloseTo(18.44, 1)
    expect(r.grassi).toBeCloseTo(7.41, 1)
    expect(r.slng).toBeCloseTo(11.12, 1)
    expect(r.altriSolidi).toBeCloseTo(0.80, 1)
    expect(r.solidiTotali).toBeCloseTo(37.78, 1)
    expect(r.pod).toBeCloseTo(17.11, 1)
    expect(r.pac).toBeCloseTo(18.08, 1)
  })
})
