import PricingHeader from '@/src/components/PricingHeader';
import Products from '@/src/components/Products';
import PricingDetails from '@/src/components/PricingDetails';

export default function Pricing() {
  return (
    <div className="pt-20">
      <PricingHeader />
      <Products />
      <PricingDetails />
    </div>
  );
}
