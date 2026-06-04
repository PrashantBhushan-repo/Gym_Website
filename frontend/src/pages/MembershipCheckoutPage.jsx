import React from 'react';
import MembershipCheckout from '../components/MembershipCheckout';
import usePageKnowledge from '../hooks/usePageKnowledge';

const MembershipCheckoutPage = () => {
  usePageKnowledge({
    slug: 'membership-checkout',
    title: 'Membership Checkout',
    category: 'membership',
    tags: ['membership', 'checkout', 'plans', 'pricing', 'gym'],
    content: `FitZone membership checkout page is where members select and purchase gym plans. It explains membership pricing, available tiers, and the process for joining the gym or renewing an existing membership through a secure checkout flow.`
  });
  return (
    <div className="membership-checkout-page-container">
      <MembershipCheckout />
    </div>
  );
};

export default MembershipCheckoutPage;
