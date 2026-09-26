export function plural(
  count: number,
  forms: { one: string; other: string },
): string {
  return `${count} ${count === 1 ? forms.one : forms.other}`;
}
