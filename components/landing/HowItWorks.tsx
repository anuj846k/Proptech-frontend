"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Component1, Component2, Component3 } from "../icons";

const steps = [
  {
    title: "Add your properties",
    description:
      "Import your properties, units, and current tenancies. Our system automatically sets up rent collection and maintenance workflows.",
    Icon: Component1,
  },
  {
    title: "Automate tenant interactions",
    description:
      "Our AI voice agent handles rent reminders, maintenance triage, and tenant screening via WhatsApp and phone calls.",
    Icon: Component2,
  },
  {
    title: "Scale your portfolio",
    description:
      "Get real-time insights on vacancy costs, rent intelligence, and maintenance expenses to maximize your ROI.",
    Icon: Component3,
  },
];

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsListRef = useRef<HTMLUListElement>(null);
  const lineContainerRef = useRef<HTMLDivElement>(null);

  const [lineTop, setLineTop] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);
  const [progressHeight, setProgressHeight] = useState(0);
  const lineHeightRef = useRef(0);

  const measureLine = () => {
    const stepsList = stepsListRef.current;
    const container = lineContainerRef.current;
    if (!stepsList || !container) return;

    const items = stepsList.querySelectorAll("li");
    if (items.length < 2) return;

    const firstIcon = items[0].querySelector<HTMLDivElement>(
      'div[class*="rounded-full"]',
    );
    const lastIcon = items[items.length - 1].querySelector<HTMLDivElement>(
      'div[class*="rounded-full"]',
    );
    if (!firstIcon || !lastIcon) return;

    const containerRect = container.getBoundingClientRect();
    const firstRect = firstIcon.getBoundingClientRect();
    const lastRect = lastIcon.getBoundingClientRect();

    const firstCenterY =
      firstRect.top - containerRect.top + firstRect.height / 2;
    const lastCenterY = lastRect.top - containerRect.top + lastRect.height / 2;
    const height = Math.max(0, lastCenterY - firstCenterY);

    lineHeightRef.current = height;
    setLineTop(firstCenterY);
    setLineHeight(height);
  };

  const updateProgress = () => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const start = windowHeight * 0.8;
    const end = -rect.height * 0.3;
    const total = start - end;
    const current = start - rect.top;
    const progress = Math.max(0, Math.min(1, current / total));

    setProgressHeight(progress * lineHeightRef.current);
  };

  useEffect(() => {
    const run = () => {
      measureLine();
      updateProgress();
    };

    const timer = setTimeout(run, 50);

    const handleResize = () => {
      measureLine();
      updateProgress();
    };

    const handleScroll = () => {
      requestAnimationFrame(updateProgress);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex w-full flex-col bg-[#F5F5F5] px-4 py-12 md:px-12 lg:px-24 lg:py-0"
    >
      <div className="flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-6 lg:flex-row lg:gap-20 lg:py-28">
        <div className="flex flex-1 flex-col gap-4 md:gap-[23.4px]">
          <h2 className="text-3xl font-semibold text-primary md:text-4xl lg:text-[60px]">
            How it works
          </h2>

          <p className="max-w-md text-base leading-6 text-[rgba(10,10,10,0.60)] md:text-[16.9px] md:leading-[29.25px]">
            A complete maintenance ecosystem with three powerful{" "}
            <span className="font-normal text-primary">
              roles working together,
            </span>{" "}
            all in one unified platform.
          </p>

          <Link
            href="/dashboard"
            className="mt-2 w-fit rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-white md:text-[13.7px]"
          >
            Start Free Trial
          </Link>
        </div>

        <div
          ref={lineContainerRef}
          className="relative mt-4 flex flex-1 flex-col lg:mt-0"
        >
          {lineHeight > 0 && (
            <div
              className="absolute left-6 hidden w-0.5 lg:block"
              style={{ top: `${lineTop}px`, height: `${lineHeight}px` }}
            >
              <div className="absolute inset-0 bg-neutral-300" />
              <div
                className="absolute top-0 w-full bg-brand-500 transition-[height] duration-500 ease-out"
                style={{ height: `${progressHeight}px` }}
              />
            </div>
          )}

          <ul ref={stepsListRef} className="flex flex-col gap-6 lg:gap-0">
            {steps.map(({ title, description, Icon }, i) => (
              <li
                key={title}
                className={`flex items-start gap-3 lg:gap-5 ${
                  i !== steps.length - 1 ? "pb-4 lg:pb-16" : ""
                }`}
              >
                <div className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white lg:mt-0 lg:h-12 lg:w-12">
                  <Icon className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
                </div>

                <div className="flex flex-col gap-1 lg:gap-2">
                  <h3 className="text-base font-bold text-[#0A0A0A] lg:text-3xl">
                    {title}
                  </h3>

                  <p className="max-w-[384px] text-xs leading-4 text-[rgba(10,10,10,0.60)] lg:text-[15.3px] lg:leading-relaxed">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
