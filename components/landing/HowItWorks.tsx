"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Component1, Component2, Component3 } from "../icons";

const steps = [
  {
    title: "Tenants Report Issues",
    description:
      "Tenants submit maintenance requests with photos and descriptions directly from their mobile device. No calls, no emails—just quick and easy reporting.",
    Icon: Component1,
  },
  {
    title: "Managers Assign & Track",
    description:
      "Property managers view all tickets, assign the right technician, set priorities, and track progress in real-time across all properties.",
    Icon: Component2,
  },
  {
    title: "Technicians Resolve Fast",
    description:
      "Technicians receive assignments on their mobile app, update task status with progress photos, and close tickets efficiently.",
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

    const firstIcon = items[0].querySelector<HTMLDivElement>('div[class*="rounded-full"]');
    const lastIcon = items[items.length - 1].querySelector<HTMLDivElement>(
      'div[class*="rounded-full"]'
    );
    if (!firstIcon || !lastIcon) return;

    const containerRect = container.getBoundingClientRect();
    const firstRect = firstIcon.getBoundingClientRect();
    const lastRect = lastIcon.getBoundingClientRect();

    const firstCenterY = firstRect.top - containerRect.top + firstRect.height / 2;
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

    const t = setTimeout(run, 50);

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
      clearTimeout(t);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex w-full flex-col bg-[#F5F5F5] px-4 md:px-12 lg:px-24 py-12 lg:py-0"
    >
      <div className="flex max-w-5xl flex-col lg:flex-row gap-8 lg:gap-20 px-4 md:px-6 py-8 lg:py-28">
        {/* Left */}
        <div className="flex flex-1 flex-col gap-4 md:gap-[23.4px]">
          <h2 className="text-3xl md:text-4xl lg:text-[60px] font-semibold text-primary">
            How it works
          </h2>

          <p className="max-w-md text-base md:text-[16.9px] leading-6 md:leading-[29.25px] text-[rgba(10,10,10,0.60)]">
            A complete maintenance ecosystem with three powerful{" "}
            <span className="font-normal text-primary">
              roles working together,
            </span>{" "}
            all in one unified platform.
          </p>

          <Link href="/dashboard" className="w-fit rounded-2xl bg-primary px-6 py-3 text-sm md:text-[13.7px] font-medium text-white mt-2">
            Start Free Trial
          </Link>
        </div>

        {/* Right */}
        <div
          ref={lineContainerRef}
          className="relative flex flex-1 flex-col mt-4 lg:mt-0"
        >
          {lineHeight > 0 && (
            <div
              className="absolute left-6 w-0.5 hidden lg:block"
              style={{ top: `${lineTop}px`, height: `${lineHeight}px` }}
            >
              {/* Static */}
              <div className="absolute inset-0 bg-neutral-300" />

              {/* Progress – smooth transition when height updates */}
              <div
                className="absolute top-0 w-full bg-brand-500 transition-[height] duration-500 ease-out"
                style={{ height: `${progressHeight}px` }}
              />
            </div>
          )}

          <ul ref={stepsListRef} className="flex flex-col gap-6 lg:gap-0">
            {steps.map(({ title, description, Icon }, i) => (
              <li
                key={i}
                className={`flex items-start gap-3 lg:gap-5 ${
                  i !== steps.length - 1 ? "lg:pb-16 pb-4" : ""
                }`}
              >
                <div className="relative z-10 flex h-8 w-8 lg:h-12 lg:w-12 items-center justify-center rounded-full bg-brand-500 text-white shrink-0 mt-0.5 lg:mt-0">
                  <Icon className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
                </div>

                <div className="flex flex-col gap-1 lg:gap-2">
                  <h3 className="text-base lg:text-3xl font-bold text-[#0A0A0A]">
                    {title}
                  </h3>

                  <p className="max-w-[384px] text-xs lg:text-[15.3px] leading-4 lg:leading-6.5 text-[rgba(10,10,10,0.60)]">
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