export function cleanObj(obj: Record<string, any>) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
}
