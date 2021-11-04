import { Injectable } from '@nestjs/common';

@Injectable()
class AppService {
  getHello(): any {
    return {
      message: 'Welcome to 2sto Api Service',
      author: 'Muritala David',
      stack: ['Nest Js', 'Prisma', 'MySQL', 'Typescript'],
    };
  }
}

export default AppService;
