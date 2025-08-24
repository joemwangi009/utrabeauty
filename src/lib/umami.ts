import umami from '@umami/node';
import { env } from './env';

umami.init({
    websiteId: env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    hostUrl: env.NEXT_PUBLIC_UMAMI_HOST_URL,
});

export const umamiTrackCheckoutSuccessEvent = async (payload: {
    [key: string]: string | number | Date
}) => {
    await umami.track('checkout_success', payload);
}
