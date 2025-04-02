import { SetMetadata } from '@nestjs/common';

/**
 * Public decorator - mark routes as public (no authentication required)
 */
export const Public = () => SetMetadata('isPublic', true);
