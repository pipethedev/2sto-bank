export enum VerificationStatus {
  VERIFIED = 1,
  UNVERIFIED = 0,
}

export enum AUTH_TYPE {
  PASSWORD = 'PASSWORD',
  FINGERPRINT = 'FINGERPRINT',
  FACEID = 'FACEID',
}

export enum KYC {
  NIN = 'NIN',
  BVN = 'BVN',
}

export enum METHOD {
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  GET = 'GET',
}

export enum OPERATION {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
}

export enum ACTION {
  BLOCK = 'block',
  UNBLOCK = 'unblock',
}
