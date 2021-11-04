export const generateToken = (
  possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
) => {
  let token = '';

  for (let i = 0; i < 20; i++)
    token += possible.charAt(Math.floor(Math.random() * possible.length));

  return token;
};

export const generateTransactionID = () => {
  let dt = Date.now();
  return 'xxxx-4xx-yxxx'.replace(/[xy]/g, (c) => {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
