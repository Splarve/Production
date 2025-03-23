// lib/utils.ts
export function cn(...classNames: (string | undefined | null | false)[]) {
    return classNames.filter(Boolean).join(' ');
  }