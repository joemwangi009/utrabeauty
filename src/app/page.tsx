import { getCurrentSession } from "@/actions/auth";
import { getWheelOfFortuneConfiguration } from "@/actions/wheel-of-fortune-actions";
import BannerCarousel from "@/components/layout/BannerCarousel";
import SalesCampaignBanner from "@/components/layout/SalesCampaignBanner";
import WheelOfFortune from "@/components/layout/WheelOfFortune";
import WheelOfFortuneEligibilityBanner from "@/components/layout/WheelOfFortuneEligibilityBanner";
import ProductGrid from "@/components/product/ProductGrid";
import { getAllProducts } from "@/sanity/lib/client";

const Home = async () => {
    const { user } = await getCurrentSession();

    const products = await getAllProducts();

    const { randomProducts, winningIndex } = await getWheelOfFortuneConfiguration();

    return (
        <div>
          <SalesCampaignBanner />
          <BannerCarousel />
          <WheelOfFortuneEligibilityBanner />
          <WheelOfFortune
            products={randomProducts}
            winningIndex={winningIndex}
          />

          <section id="products" className='container mx-auto py-8'>
            <ProductGrid products={products} />
          </section>
        </div>
    );
}

export default Home;