export const userIncludeObject = {
  owner: {
    select: {
      uid: true,
      firstname: true,
      lastname: true,
      email: true,
      type: true,
    },
  },
};

export const userExcludeArray = [
  'id',
  'uid',
  'deviceId',
  'pin',
  'email_verified_at',
  'accountVerifyToken',
  'accountVerifyExpires',
  'passwordResetToken',
  'verificationCode',
  'passwordResetExpires',
  'password',
];
