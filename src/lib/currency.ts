/**
 * Format a number as Franc CFA (XOF).
 * Example: formatCFA(1500) → "1 500 FCFA"
 */
export function formatCFA(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
  return `${formatted} FCFA`;
}
