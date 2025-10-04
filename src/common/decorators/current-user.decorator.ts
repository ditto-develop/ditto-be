import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../typeguards/auth.typeguard';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): UserPayload | null => {
  const req = ctx.switchToHttp().getRequest<{ user?: UserPayload }>();
  return req.user ?? null;
});
