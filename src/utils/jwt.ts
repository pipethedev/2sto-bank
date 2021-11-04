import { sign, verify } from 'jsonwebtoken';

export const signToken = (id: string, is_admin?: boolean) => {
  return sign({ id, is_admin }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const retrieveTokenValue = async <T>(
  token: string,
): Promise<T & { iat: number; exp: number }> => {
  return new Promise<T & { iat: number; exp: number }>((res, rej) =>
    verify(token, process.env.JWT_SECRET, (err, value: unknown) => {
      if (err) return rej(err);
      res(value as T & { iat: number; exp: number });
    }),
  );
};
