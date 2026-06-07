import AuraPlatform from '../components/AuraPlatform';
import Comparison from '../components/Comparison';

export default function Platform() {
  return (
    <div className="pt-24">
      <div id="platform">
        <AuraPlatform />
      </div>
      <div id="comparison">
        <Comparison />
      </div>
    </div>
  );
}
