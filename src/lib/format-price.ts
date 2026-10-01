// One price format for every customer-facing product price: thousands
// separator and two decimals, e.g. 1,489.47.
export function formatIls(n: number) {
  return n.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
