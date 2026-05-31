export const passportJwtSecret = jest.fn(() => {
  return (
    _request: unknown,
    _rawJwtToken: string,
    done: (error: Error | null, secret?: string) => void,
  ) => {
    done(null, 'test-secret');
  };
});
