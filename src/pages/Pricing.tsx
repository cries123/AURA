import PricingHeader from '../components/PricingHeader';
import Products from '../components/Products';
import PricingDetails from '../components/PricingDetails';

export default function Pricing() {
  return (
    <div className="pt-20">
      <PricingHeader />
      <Products />
      <PricingDetails />
    </div>
  );
}
