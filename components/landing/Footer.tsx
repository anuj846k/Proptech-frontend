import { ArrowRight, Building2, Mail } from "lucide-react";

type FooterLinkGroup = {
  title: string;
  minWidth?: string;
  links: { label: string; href: string }[];
};

const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: "MENU",
    minWidth: "min-w-[70.06px]",
    links: [
      { label: "Customers", href: "#" },
      { label: "Resources", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "Help", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
  {
    title: "SOCIAL",
    minWidth: "min-w-[68.17px]",
    links: [
      { label: "X (Twitter)", href: "#" },
      { label: "Email", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
];

const headingClass =
  "flex flex-col items-start self-stretch text-white/50  text-[12px] font-[510] leading-[16px]  uppercase";

const linkClass =
  "flex flex-col items-start self-stretch pt-[2.75px] pb-[1.25px] text-white text-[13.7px] font-[400] leading-[20px]";

const Footer = () => {
  return (
    <footer className="relative flex w-full flex-col items-start bg-[#F5F5F5] pt-24 md:pt-[152px]">
      <div className="flex flex-col items-start self-stretch rounded-tl-[48px] rounded-tr-[48px] rounded-b-none bg-brand-500 px-6 pb-16 pt-[360px] md:px-16 md:pt-[320px] lg:px-[213px] lg:pt-[384px]">
        <div className="flex max-w-[1024px] flex-col items-start gap-[88px] self-stretch px-[24px] py-0">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-16 self-stretch">
            <a
              href="#"
              className="flex items-center gap-[8px]"
              aria-label="proptech Home"
            >
              <div className="h-[32px] w-[32px] rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="flex flex-col items-start text-white font-bold text-xl ">
                proptech
              </span>
            </a>

            <nav
              className="flex items-start flex-wrap md:flex-nowrap gap-8 md:gap-[64px] w-full md:w-auto"
              aria-label="Footer Navigation"
            >
              {FOOTER_LINK_GROUPS.map((group) => (
                <div
                  key={group.title}
                  className={`flex flex-col items-start gap-[16px] self-stretch ${
                    group.minWidth ?? ""
                  }`}
                >
                  <h2 className={headingClass}>{group.title}</h2>

                  <ul className="flex flex-col items-start gap-[8px] self-stretch">
                    {group.links.map((link) => (
                      <li key={link.label} className="self-stretch">
                        <a href={link.href} className={linkClass}>
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <p className="flex flex-col items-center self-stretch text-center text-white/50 text-[13.6px]  leading-5">
            © 2026 proptech. All rights reserved.
          </p>
        </div>
      </div>

      <div className="absolute left-1/2 top-0 w-full max-w-[1024px] -translate-x-1/2 px-4 md:px-8">
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[32px] border border-white/20 px-4 py-14 text-center shadow-2xl md:px-6 md:py-20 lg:py-28">
          <div
            className="absolute inset-0 z-0 blur-[7px] scale-[1.02]"
            style={{
              backgroundImage: "url('/Assets/bg2.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          <h1 className="relative z-10 mb-8 text-3xl font-semibold leading-[1.1] text-primary md:mb-10 md:text-5xl lg:text-[56px]">
            Streamline your maintenance
            <br />
            workflow today
          </h1>

          <div className="relative z-10 flex w-full max-w-md flex-col gap-2 rounded-[28px] border border-white/50 bg-white/90 p-2 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-1.5">
            <div className="pl-3 pr-2 text-gray-500 sm:pl-4">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              placeholder="Enter your email"
              className="min-w-0 flex-1 bg-transparent px-1 text-sm text-gray-900 outline-none placeholder:text-gray-500 md:text-base"
            />
            <button className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 md:px-6 md:py-3">
              Join Waitlist
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
