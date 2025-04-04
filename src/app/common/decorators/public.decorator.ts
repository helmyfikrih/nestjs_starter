import { SetMetadata } from '@nestjs/common';

/**
 * Public decorator - mark routes as public (no authentication required)
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
