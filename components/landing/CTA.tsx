import { ArrowRight, Building2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="relative w-full flex justify-center items-center overflow-hidden min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
      <div className="absolute inset-0">
        {/* Background Image */}
        <Image
          src="/Assets/cta.png"
          alt="CTA Background"
          fill
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full max-w-xl md:max-w-2xl lg:max-w-lg px-4 py-8 md:py-12 lg:py-16">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Top Label */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 md:w-12 h-8 md:h-12 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-4 md:w-6 h-4 md:h-6" />
            </div>
            <Link href="/dashboard" className="text-sm md:text-lg lg:text-2xl font-bold tracking-[0.2em] text-black uppercase hover:text-blue-600 transition-colors">
              Get Started
            </Link>
          </div>

          {/* Heading */}
          <h2 className="text-base md:text-xl lg:text-[32px] leading-tight md:leading-[1.1] font-medium tracking-tight text-black">
            From tenant reports to technician completion—every{' '}
            <span className="text-blue-500">maintenance workflow</span> in one place.
          </h2>

          {/* Buttons */}
          <div className="flex items-center gap-2 md:gap-4">
            <button className="bg-black text-white px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-2xl text-sm md:text-base font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
              Start Free Trial
            </button>

            <button
              aria-label="Continue"
              className="bg-blue-500 text-white w-10 md:w-14 h-10 md:h-14 rounded-lg md:rounded-2xl hover:bg-blue-600 transition-colors flex items-center justify-center shrink-0"
            >
              <ArrowRight className="w-4 md:w-6 h-4 md:h-6" />
            </button>
          </div>

          {/* Decorative Lines - hidden on very small screens */}
          <div className="hidden sm:flex flex-col gap-1 md:gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-0.5 md:h-1 bg-blue-500 ${i === 5 ? 'w-1/2' : 'w-3/4'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
