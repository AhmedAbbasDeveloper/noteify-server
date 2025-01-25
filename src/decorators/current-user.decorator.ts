import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { CurrentUserDocument } from '@/users/schemas/current-user.schema';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserDocument => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as CurrentUserDocument;
  },
);
