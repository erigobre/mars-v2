
export class ApiValidationError extends Error {
  constructor(
    public readonly fields: Record<string, string[]>,
    message: string
  ) {
    super(message);
    this.name = "ApiValidationError";
  }
}
