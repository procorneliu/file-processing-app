import { UseGuards } from '@nestjs/common';
import { SubscriptionGuard } from '../guards/subscription.guard';

export const RequirePro = () => UseGuards(SubscriptionGuard);
