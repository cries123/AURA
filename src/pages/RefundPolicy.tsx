const refundSections = [
  {
    title: 'Hardware orders',
    body: 'Aura Tap hardware orders are prepared for activation and fulfillment after purchase. If your order has not entered preparation or shipment, contact us as soon as possible to request cancellation.',
  },
  {
    title: 'Custom and bundle orders',
    body: 'Custom-branded, programmed, or team bundle orders may be non-refundable once setup, programming, or production work has started.',
  },
  {
    title: 'Damaged or defective items',
    body: 'If an item arrives damaged or does not function under normal use, contact support with your order details. Eligible hardware issues may be handled under the warranty policy.',
  },
  {
    title: 'Shipping window',
    body: 'Standard hardware orders are expected to ship in 3-5 days. Shipping delays do not automatically qualify for a refund, but we will help resolve fulfillment issues.',
  },
];

export default function RefundPolicy() {
  return (
    <div id="refund-policy" className="min-h-screen px-6 pb-24 pt-36 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16">
          <div className="mb-5 font-mono text-[10px] font-black uppercase tracking-[0.42em] text-aura-gold">
            Policy / Refunds
          </div>
          <h1 className="font-display text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] md:text-7xl">
            Refund Policy
          </h1>
          <p className="mt-8 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
            This policy summarizes refunds, cancellations, and hardware support for Aura Tap purchases.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {refundSections.map((section) => (
            <section key={section.title} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 backdrop-blur">
              <h2 className="mb-4 font-display text-2xl font-bold text-white">{section.title}</h2>
              <p className="text-sm leading-7 text-zinc-500">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-aura-lime/20 bg-aura-lime/5 p-8 text-sm leading-7 text-zinc-400">
          Need help with an order? Email{' '}
          <a href="mailto:support@aurataps.net" className="font-bold text-aura-lime hover:text-white">
            support@aurataps.net
          </a>
          {' '}with your order number.
        </div>
      </div>
    </div>
  );
}
