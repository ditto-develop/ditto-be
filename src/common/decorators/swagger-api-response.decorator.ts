import { ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponse as CustomApiResponse } from '../dtos/api-response.dto';
import { Type } from '@nestjs/common';

export const SwaggerApiResponse = (config?: { status?: number; type?: Type; isArray?: boolean }) =>
  ApiResponse({
    status: config?.status ?? 200,
    schema: {
      type: 'object',
      allOf: [
        { $ref: getSchemaPath(CustomApiResponse) },
        ...(config?.type
          ? [
              {
                properties: {
                  data: config.isArray
                    ? {
                        type: 'array',
                        items: { $ref: getSchemaPath(config.type) },
                      }
                    : { $ref: getSchemaPath(config.type) },
                },
              },
            ]
          : []),
      ],
    },
  });
