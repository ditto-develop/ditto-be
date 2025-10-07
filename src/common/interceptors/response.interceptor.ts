import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { SuccessApiResponse } from '../dtos/api-response.dto';
import { isApiResponse } from '../typeguards/http.type-guard';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessApiResponse<unknown>> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (isApiResponse(data)) {
          return data;
        }

        return new SuccessApiResponse({
          success: true,
          data,
        });
      }),
    );
  }
}
