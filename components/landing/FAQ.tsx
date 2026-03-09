'use client';

import { useState } from 'react';
import { MyChevronDown } from '../icons';
import Link from 'next/link';

type FAQItem = {
  que: string;
  ans: string;
};

const FAQ = () => {
  const faqs: FAQItem[] = [
    {
      que: 'How do tenants submit maintenance requests?',
      ans: 'Tenants can submit requests through our mobile-first web portal. They simply fill in the issue title, description, and upload photos directly from their phone. No app download required.',
    },
    {
      que: 'Can property managers assign tasks to specific technicians?',
      ans: 'Yes! Property managers can view all open tickets, check technician availability, and assign the right person for each job. They can also set priority levels and due dates.',
    },
    {
      que: 'How do technicians receive and update tasks?',
      ans: 'Technicians receive push notifications for new assignments. They can view their task list, update status (Assigned → In Progress → Completed), and add completion notes with photos.',
    },
    {
      que: 'What happens to requests after they are completed?',
      ans: 'Once a technician marks a task as complete and the tenant confirms, the ticket is archived. Managers can view historical data and reports on response times and completion rates.',
    },
    {
      que: 'Is there a notification system?',
      ans: 'Yes! The system sends email notifications for key events: new requests, assignments, status changes, and task completions. Everyone stays informed in real-time.',
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="flex w-full flex-col items-center gap-10 md:gap-16 bg-[#F5F5F5] py-12 md:py-30 px-4 md:px-8">
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 md:gap-16">
        {/* Upper section */}
        <div className="flex flex-col items-center gap-3 md:gap-[13.3px] self-stretch pt-[2.75px]">
          <h1 className="flex flex-col items-center self-stretch text-center text-[#0A0A0A] text-2xl md:text-4xl lg:text-[48px] font-semibold leading-tight md:leading-12 ">
            Everything you need to know
          </h1>

          <div className="flex w-full max-w-xl flex-col items-center pt-[2.7px] text-center text-[#737373] text-sm md:text-base lg:text-[16.9px] font-normal leading-6 md:leading-7">
            Can&apos;t find the answer you&apos;re looking for? Reach out!
          </div>

          <div className="flex flex-wrap content-center items-center justify-center self-stretch gap-2 md:gap-3 pt-4 md:pt-[18.7px]">
            <Link
              href="/dashboard"
              className="flex items-center justify-center px-4 md:px-6 py-2 md:py-2.5 text-center bg-brand-600 text-white text-sm md:text-[13.7px] font-[590] leading-5 rounded-xl "
            >
              Get Started
            </Link>

            <a
              href=""
              className="flex items-center justify-center rounded-xl border border-[#E5E5E5] bg-white px-4 md:px-6 py-2 md:py-2.5 text-center text-sm md:text-[13.7px] font-[590] leading-5"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Questions and answers */}
        <div className="flex flex-col items-start gap-3 self-stretch">
          {faqs.map((faq, index) => (
            <button
              key={index}
              onClick={() => toggleFAQ(index)}
              className="flex flex-col items-start self-stretch p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.10),0_1px_2px_-1px_rgba(0,0,0,0.10)]"
            >
              <div className="flex items-center justify-between self-stretch gap-2">
                <h1 className="flex flex-col items-start text-[#0A0A0A] text-sm md:text-base lg:text-[16.9px] font-[510] leading-6 md:leading-7 ">
                  {faq.que}
                </h1>

                <MyChevronDown
                  className={`flex flex-col items-start w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 shrink-0 ${activeIndex === index ? 'rotate-180' : 'rotate-0'
                    }`}
                />
              </div>

              {activeIndex === index && (
                <div className="flex flex-col items-start self-stretch pt-3 md:pt-4">
                  <p className="self-stretch text-[#737373] text-xs md:text-sm lg:text-[15.3px] font-normal leading-5 md:leading-6.5">
                    {faq.ans}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
