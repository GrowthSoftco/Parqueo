// Nivel de plan para gatear módulos. El trial (plan null) tiene acceso
// completo a propósito (tier máximo) durante la prueba.
// BASICO = 1 · PRO = 2 · NEGOCIO / trial = 3
export function planTier(plan: string | null | undefined): number {
  return plan === 'PRO' ? 2 : plan === 'BASICO' ? 1 : 3
}
