function toStringSet(thing: unknown): Set<string> {
  const set = new Set<string>();

  if (Array.isArray(thing)) {
    for (const item of thing) {
      if (typeof item === 'string') {
        set.add(item);
      }
    }
  }

  return set;
}

export { toStringSet };
