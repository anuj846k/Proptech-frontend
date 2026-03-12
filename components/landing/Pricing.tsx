import React from "react";
import { TickMark } from "../icons";
import Link from "next/link";

type Plan = {
  name: string;
  price: string;
  billing: string;
  features: string[];
  highlight: boolean;
  badge?: string;
};

const plans: Plan[] = [
  {
    name: "Starter",
    price: "₹4,099",
    billing: "Billed annually, or ₹4,999/mo billed monthly",
    features: [
      "Up to 50 Units",
      "Automated Rent Collection",
      "Basic Maintenance Ticketing",
      "Email Support",
    ],
    highlight: false,
  },
  {
    name: "Professional",
    price: "₹12,499",
    billing: "Billed annually, or ₹14,999/mo billed monthly",
    features: [
      "Up to 200 Units",
      "AI Voice Agent (100 calls/mo)",
      "WhatsApp Integration",
      "Priority Support",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "₹33,499",
    billing: "Billed annually, or ₹41,999/mo billed monthly",
    features: [
      "Unlimited Units",
      "Unlimited AI Voice Calls",
      "Custom Integrations",
      "Dedicated Account Manager",
    ],
    highlight: false,
  },
];

type FeatureItemProps = {
  text: string;
};

const FeatureItem: React.FC<FeatureItemProps> = ({ text }) => {
  return (
    <li className="flex items-start gap-2 self-stretch md:gap-3">
      <span className="h-4 w-4 shrink-0">
        <TickMark className="h-2 w-2.5 stroke-[#0A0A0A] stroke-[1.667px] opacity-100 md:h-[7.333px] md:w-[10.667px]" />
      </span>

      <span className="flex flex-col items-start text-xs font-normal leading-5 text-[#0A0A0A] md:text-[13.7px]">
        {text}
      </span>
    </li>
  );
};

type PricingCardProps = {
  plan: Plan;
};

const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const cardBase =
    "flex flex-1 flex-col items-start self-stretch bg-white p-4 md:p-6 lg:p-8";

  const cardStyle = plan.highlight
    ? "relative rounded-2xl"
    : "rounded-3xl border border-[#E5E5E5]";

  return (
    <div
      className={
        plan.highlight
          ? "relative flex self-stretch lg:w-[300px] lg:flex-none"
          : "flex self-stretch lg:w-[300px] lg:flex-none"
      }
    >
      {plan.highlight && (
        <div className="absolute -bottom-1 -left-1 -right-1 -top-1 rounded-[19.2px] bg-brand-500" />
      )}

      <div className={`${cardBase} ${cardStyle}`}>
        <h3 className="flex w-full flex-col items-start text-lg font-black leading-6 text-[#0A0A0A] md:w-[254px] md:text-[18.8px] md:leading-7">
          {plan.name}
        </h3>

        <div className="flex w-full flex-col items-start pt-3 md:w-[254px] md:pt-4">
          <div className="flex flex-col items-start gap-2 self-stretch">
            <div className="flex items-end gap-2 self-stretch md:gap-3">
              <div className="flex flex-col items-start text-2xl font-bold leading-tight tracking-[-1.2px] text-[#0A0A0A] md:text-3xl lg:text-[47.8px] lg:leading-12">
                {plan.price}
              </div>

              <div className="flex flex-col items-start pb-0.5 text-xs font-normal leading-5 text-[#737373] md:pb-1 md:text-[13.7px]">
                /month
              </div>
            </div>

            <p className="flex flex-col items-start self-stretch text-xs font-normal leading-5 text-[#737373] md:text-[13.6px]">
              {plan.billing}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-start pt-4 md:w-[254px] md:pt-6">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center self-stretch rounded-xl py-2.5 text-center text-sm font-[590] leading-5 md:rounded-2xl md:py-3 md:text-[13.7px] ${
              plan.highlight
                ? "bg-[#0A0A0A] text-white"
                : "bg-[#F5F5F5] text-[#0A0A0A]"
            }`}
          >
            Get Started
          </Link>
        </div>

        <div className="flex w-full flex-col items-start pt-4 md:w-[254px] md:pt-6">
          <div className="flex flex-col items-start gap-3 self-stretch md:gap-4">
            <p className="flex flex-col items-start self-stretch text-xs font-[510] leading-5 text-[#737373] md:text-[13.6px]">
              Includes:
            </p>

            <ul className="flex flex-col items-start gap-2 self-stretch md:gap-3">
              {plan.features.map((feature: string, index: number) => (
                <FeatureItem key={index} text={feature} />
              ))}
            </ul>
          </div>
        </div>

        {plan.highlight && plan.badge && (
          <div className="absolute left-1/2 -top-3 flex w-[100px] -translate-x-1/2 flex-col items-start md:left-[93.65px] md:w-[132.7px] md:translate-x-0 md:-top-4">
            <div className="flex items-start rounded-full bg-brand-500 px-3 py-1 text-[10px] font-[590] uppercase leading-4 tracking-[0.3px] text-white md:px-4 md:py-1.5 md:text-[12px]">
              {plan.badge}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Pricing: React.FC = () => {
  return (
    <section className="flex w-full flex-col items-center bg-[#F5F5F5] px-4 py-16 md:px-12 md:py-28 lg:px-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 md:gap-16">
        <div className="flex flex-col items-center self-stretch pt-[2.75px]">
          <h2 className="self-stretch text-center text-3xl font-semibold leading-tight text-primary md:text-4xl md:leading-12 lg:text-[48px]">
            Simple, transparent pricing
          </h2>

          <p className="w-full max-w-2xl px-4 pt-[2.7px] text-center text-sm font-normal leading-6 text-[#737373] md:text-base md:leading-7 lg:text-[16.9px]">
            Choose the plan that works best for your portfolio. All plans
            include a 14-day free trial.
          </p>
        </div>

        <div className="flex flex-col items-stretch justify-center gap-6 self-stretch px-2 lg:mx-auto lg:w-fit lg:flex-row lg:items-stretch lg:justify-center lg:gap-8 lg:px-0">
          {plans.map((plan: Plan, index: number) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
