import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../dtos/api-response.dto';
import { isApiResponse } from '../typeguards/http.type-guard';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<unknown>> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (isApiResponse(data)) {
          return data;
        }

        return new ApiResponse({
          success: true,
          message: '요청에 성공했습니다.',
          data,
        });
      }),
    );
  }
}
