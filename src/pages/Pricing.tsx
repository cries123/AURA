import PricingHeader from '../components/PricingHeader';
import Products from '../components/Products';
import PricingDetails from '../components/PricingDetails';

export default function Pricing() {
  return (
    <div className="relative min-h-screen text-white">
      <div id="pricing-hero">
        <PricingHeader />
      </div>
      <Products />
      <PricingDetails />
    </div>
  );
}
