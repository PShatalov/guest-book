import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let logger: {
    warn: jest.Mock;
    error: jest.Mock;
  };
  let response: Pick<Response, 'status' | 'json'>;
  let request: Pick<Request, 'method' | 'url'>;
  let host: ArgumentsHost;

  beforeEach(() => {
    logger = {
      warn: jest.fn(),
      error: jest.fn(),
    };
    filter = new GlobalExceptionFilter(logger as unknown as PinoLogger);

    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    request = {
      method: 'GET',
      url: '/messages',
    };
    host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as ArgumentsHost;
  });

  it('logs 4xx HttpException at warn and returns the response body', () => {
    const exception = new NotFoundException('Message not found');

    filter.catch(exception, host);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        req: { method: 'GET', url: '/messages' },
      }),
      'HTTP exception',
    );
    expect(logger.error).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Message not found',
        statusCode: HttpStatus.NOT_FOUND,
      }),
    );
  });

  it('logs 5xx HttpException at error', () => {
    const exception = new HttpException(
      'Upstream failure',
      HttpStatus.BAD_GATEWAY,
    );

    filter.catch(exception, host);

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_GATEWAY,
      }),
      'HTTP exception',
    );
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('logs unhandled errors at error and returns 500', () => {
    filter.catch(new Error('boom'), host);

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        err: expect.any(Error),
        req: { method: 'GET', url: '/messages' },
      }),
      'Unhandled server error',
    );
    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
});
