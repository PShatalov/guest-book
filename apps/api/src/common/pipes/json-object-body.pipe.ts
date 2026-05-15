import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class JsonObjectBodyPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type !== 'body') {
      return value;
    }

    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Request body must be a JSON object',
        error: 'Bad Request',
      });
    }

    return value;
  }
}
