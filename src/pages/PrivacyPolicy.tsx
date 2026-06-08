const privacySections = [
  {
    title: 'Information we collect',
    body: 'We collect the information you submit through Aura Tap forms, checkout, portal enrollment, and profile setup, such as name, email, company, profile details, and order preferences.',
  },
  {
    title: 'How we use information',
    body: 'We use your information to fulfill orders, configure NFC profiles, provide support, manage affiliate applications, send setup instructions, and improve the Aura Tap experience.',
  },
  {
    title: 'Sharing and storage',
    body: 'We do not sell your personal information. We may use trusted service providers for hosting, authentication, payment, analytics, and customer support where needed to operate the service.',
  },
  {
    title: 'Your choices',
    body: 'You can request updates, corrections, or removal of your information by contacting support. Some order and transaction records may be retained where required for business, tax, fraud prevention, or legal reasons.',
  },
];

export default function PrivacyPolicy() {
  return (
    <div id="privacy-policy" className="min-h-screen px-6 pb-24 pt-36 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16">
          <div className="mb-5 font-mono text-[10px] font-black uppercase tracking-[0.42em] text-aura-gold">
            Policy / Privacy
          </div>
          <h1 className="font-display text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] md:text-7xl">
            Privacy Policy
          </h1>
          <p className="mt-8 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
            This policy explains how Aura Tap handles information submitted through our website, products, and platform.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {privacySections.map((section) => (
            <section key={section.title} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 backdrop-blur">
              <h2 className="mb-4 font-display text-2xl font-bold text-white">{section.title}</h2>
              <p className="text-sm leading-7 text-zinc-500">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-aura-gold/15 bg-black/25 p-8 text-sm leading-7 text-zinc-500">
          For privacy questions, email{' '}
          <a href="mailto:support@aurataps.net" className="font-bold text-aura-gold hover:text-white">
            support@aurataps.net
          </a>
          .
        </div>
      </div>
    </div>
  );
}
