import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

interface ClientErrorResponse {
  statusCode: number;
  message?: any;
  type: string;
  stack?: any;
  error?: any;
}

@Catch()
class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const { statusCode, type, message, error, stack } =
      process.env.STAGE === 'production'
        ? this.handleErrorProd(exception, request)
        : this.handleErrorDev(exception);

    response.status(statusCode).json({
      statusCode,
      type,
      message,
      error,
      stack,
    });
  }

  handleErrorDev(exception: any): ClientErrorResponse {
    exception =
      exception instanceof HttpException
        ? exception
        : new HttpException(exception, 400);
    const response = exception.getResponse();
    return {
      statusCode: exception.getStatus(),
      type: response.error,
      error: response.message,
      message: exception.message,
      stack: exception.stack,
    };
  }

  handleErrorProd(exception: any, request: Request): ClientErrorResponse {
    if (!(exception instanceof HttpException)) {
      // set a fallback error instance
      console.log('Error: ', exception.message);

      // handle all prisma exceptions
      if (
        exception instanceof Prisma.PrismaClientKnownRequestError ||
        exception instanceof Prisma.PrismaClientValidationError
      ) {
        const response = this.handlePrimsaErrors(exception, request);
        exception = new HttpException(response, response.status);
      }
      // handle all aws exceptions
      // handle all JWT errors
      if (
        exception.name === 'TokenExpiredError' ||
        exception.name === 'JsonWebTokenError'
      ) {
        const response = this.handleJWTErrors(exception);
        exception = new HttpException(response, response.status);
      }
    }

    if (!(exception instanceof HttpException))
      exception = new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const response = exception.getResponse();
    return {
      statusCode: exception.getStatus(),
      type: response.error,
      error: response.message,
      message: exception.message,
    };
  }

  handlePrimsaErrors(e: any, req: Request) {
    console.log(e);
    const response = {
      message: '',
      error: 'InvalidEntityException',
      status: HttpStatus.UNPROCESSABLE_ENTITY,
    };

    let code;
    if (!e.code && e.message.includes('Unknown field')) {
      code = 'UnknownField';
    } else if (!e.code && e.message.includes('Got invalid value')) {
      code = 'InvalidValue';
    } else if (!e.code) {
      code = 'Unknown';
    } else {
      code = e.code.toString();
    }

    switch (code) {
      case 'P2002':
        response.message = `Field \`${e.meta.target}\` already exist`;
        break;
      case 'P2022':
        response.message = `Column ${e?.meta?.column} does not exist`;
        break;
      case 'P2025':
        response.message = `Record to ${req.method.toLowerCase()} does not exist`;
        break;
      case 'UnknownField':
        response.error = code;
        response.message = e.message.split(`\n\n\n`)[1]?.split('.')[0];
        break;
      case 'InvalidValue':
        response.error = code;
        response.message = e.message.split(`\n}\n\n`)[1]?.split(`\n{\n`)[0];
        break;
      default:
        response.message = e?.meta?.cause || e.message;
    }

    return response;
  }

  handleJWTErrors(e: any) {
    const response = {
      message: '',
      error: 'AuthenticationException',
      status: HttpStatus.UNAUTHORIZED,
    };

    switch (e.name) {
      case 'TokenExpiredError':
        response.message = 'Token expired. Please login again!';
        break;
      case 'JsonWebTokenError':
        response.message = 'Invalid token. Please login again!';
        break;
      default:
        response.message = 'Invalid token. Please login again!';
    }

    return response;
  }
}

export default GlobalExceptionsFilter;
