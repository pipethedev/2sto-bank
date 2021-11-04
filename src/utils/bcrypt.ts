import { BCRYPT_SALT } from '@constants/app';
import { CardInterface } from '@interface/entities';
import { hash, compare } from 'bcryptjs';
import * as forge from 'node-forge';

export const encrypt = async (password: string): Promise<string> => {
  return await hash(password, BCRYPT_SALT);
};

export const verify = async (password: string, encrypted: string) => {
  return await compare(password, encrypted);
};

export const three3d = async (data: CardInterface) => {
  const cipher = forge.cipher.createCipher(
    '3DES-ECB',
    forge.util.createBuffer(process.env.ENCRYPTION_KEY),
  );
  cipher.start({ iv: '' });
  cipher.update(forge.util.createBuffer(JSON.stringify(data), 'utf8'));
  cipher.finish();
  const encrypted = cipher.output;
  return await forge.util.encode64(encrypted.getBytes());
};
