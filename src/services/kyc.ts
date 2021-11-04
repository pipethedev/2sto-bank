import { InternalServerErrorException } from '@nestjs/common';
import { KYC } from '@enum/auth';
import fetch from 'node-fetch';
import { Injectable } from '@nestjs/common';

@Injectable()
class kycService {
  // constructor() {}
  async verify(bvn: string, type: KYC): Promise<any> {
    try {
      const platform = type == 'BVN' ? 'bvn' : 'national_id';
      const data = await fetch(
        `https://api.appruve.co/v1/verifications/ng/${platform}`,
        {
          method: 'post',
          body: JSON.stringify({
            id: bvn,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.APPRUVE_TOKEN}`,
          },
        },
      );
      return await data.json();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}

export default kycService;
