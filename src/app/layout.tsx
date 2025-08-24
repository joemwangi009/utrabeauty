import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import { getCurrentSession } from '@/actions/auth';
import { SanityLive } from '@/sanity/lib/live';
import HeaderCategorySelector from '@/components/layout/HeaderCategorySelector';
import Cart from '@/components/cart/Cart';
import Script from 'next/script';
import { Suspense } from 'react';
import AnalyticsTracker from '@/components/layout/AnalyticsTracker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Utrabeauty - Beauty & Wellness E-Commerce',
    description: 'Discover amazing beauty and wellness products at unbeatable prices. Shop the latest trends with free shipping on orders over $15.',
};

const RootLayout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const { user } = await getCurrentSession();

    return (
        <html lang='en'>
            <body className={`${inter.className} antialiased bg-white min-h-[125vh]`}>
                <Header 
                    user={user}
                    categorySelector={<HeaderCategorySelector />}
                />
                <Script
                    src='https://cloud.umami.is/script.js'
                    data-website-id='548dea12-b06b-43e1-a75b-c4bd736005be'
                    strategy='beforeInteractive'
                />

                <Suspense>
                    <AnalyticsTracker
                        user={user}
                    />
                </Suspense>

                {children}

                <Cart />
                <SanityLive />
            </body>
        </html>
    );
};

export default RootLayout;
