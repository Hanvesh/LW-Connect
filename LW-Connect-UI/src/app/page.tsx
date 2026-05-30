import Link from 'next/link'
import { MaterialIcon } from '@/components/ui/material-icon'

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBHuXnuQaWbzRfE5CHSu1RXoYYdgfsiOiiPpqvJ4HTgLaEFoyfVWWPiuCEDyrfaLHT5qNHASmBtfsuYTq59Yz3YKC0MN1VwGysS7RnrM9f_RDCGxGnC9v1TVz-rZO_f2MNJqC8QI5bSD4RRM9-XEu6pwY3DeyWdmFRqQaf6fpzIFMfy16Aad7eZXsd3SuXemRkDXseWUat-V-3OeRsmV0i7-GB_GVxyY-BGLy4PP05HTRNC-cyt4m8_m-zNghfIINZlNcYJ-HbNh24'

const MENTORS = [
  {
    name: 'Sarah Chen',
    title: 'Former CTO, Smart Cities Dept.',
    tags: ['Digital Governance', 'AI Ethics'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAavtPnZE6N-m-VhLqx3cNHyw_lhotbh2XUux31IK6P4jqQKb3lr8N3-b5TDWoqEQC7G2KtkoL0D3rmZQ0_8h6PYR2WoL69CBV2FNfL1XZv6HM8J1r7FMASNvJv_5OMmDAv-_iIGpPaFkVGQ4-fiVFq0qfBFQaquJKbw541aVPIkvozbrhUKDgkJQKV9bmKXFfWIrcD3ZxzKSp5PWri3KW5FvuM_Zur10EMfvhYw4NeMUMQ37j-LxC_y9jBje1_b_khgNHQ9m2Z7z4',
  },
  {
    name: 'Marcus Thorne',
    title: 'Head of Public Safety Innovation',
    tags: ['Security Infrastructure', 'IoT'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD-YogkyoSUM1Xd5Y7sszAvim03u7B57awbfQNlqsVryrpwlE8wVzjULLUInk6zE4wKzL46HcWur91vKd4q6wctu1hqeMOuLSQXOpVumx-i7oNlvONtnRtdhNhO4H8RxuTeNKaRQdTRYkNGNiM8lVbkeRMojL0F6X19OY_-IhzVtK1FI4FmR43-As44Jhg07i75RVxUTo065JDBt23-QpWiZcuuEuYJA7r_i67YToYGzpUyfyIVw9UyGhVB1X2VbWE_oTFylz5RZHs',
  },
  {
    name: 'Elena Rodriguez',
    title: 'Sustainability Policy Lead',
    tags: ['Green Energy', 'Grants'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDVslQHhUH2AiEdham938WioXORo9EG9dJ02iPRvzgp7lBZDE94znLQ7iJZ2ruTEjPx_Hx26nCNuADZD5XE72SDjelS1mOo1douqK46kI2KW7NgUXqdAdsyR4FVAUVuTZltI2g_FCJtN_CeV8pfqicoQArSHJe5yTCXJ2SAlPn_p4ctqq7l1W9xA5bKbHts1gAxywXK6rOkRkcCHq8jSY0tDP0FChU72YMayUuBZGkF6HXGx__JGtUtXypRdEq3Rvrco99KVTDbrRM',
  },
  {
    name: 'James Wilson',
    title: 'Director of Digital Experience',
    tags: ['UX Design', 'Agile Gov'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCbqMGHf_puWJNFPf4J8A3tEqPu0LAAw1PJkZld7tiitt0NVmS8fI5tYO3mzrbJQphpNaUtyCuvEDRa2i6zSWsuvbTLdfkHalTdSnB2J2PCUCuw_T26KR8wupsNs4gGn3Pch7_8usqOPS3-UPBC9oa1tKixobMImQXn0GNL-IkkY7echzPfB8o1wH8F6M58L0iR56gLiEu0NdeIDwfquoXzRV1dzTAUywBiyKsplhBIzf3STrWN1jbsA3ID4dWN_hO40kgbb_V6pHE',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-sm">
          <span className="text-headline-md font-bold text-primary">LW-Connect</span>
        </div>
        <div className="hidden md:flex items-center gap-xl">
          <Link href="/dashboard" className="text-label-md text-primary font-bold border-b-2 border-secondary py-1">
            Dashboard
          </Link>
          <Link href="/courses" className="text-label-md text-on-surface-variant hover:text-primary transition-opacity">
            Courses
          </Link>
          <Link href="/mentors" className="text-label-md text-on-surface-variant hover:text-primary transition-opacity">
            Mentors
          </Link>
          <Link href="/admin/dashboard" className="text-label-md text-on-surface-variant hover:text-primary transition-opacity">
            Analytics
          </Link>
        </div>
        <div className="flex items-center gap-md">
          <MaterialIcon name="notifications" className="text-on-surface-variant cursor-pointer hover:text-primary transition-opacity" />
          <MaterialIcon name="auto_awesome" className="text-on-surface-variant cursor-pointer hover:text-primary transition-opacity" />
          <Link href="/login">
            <MaterialIcon name="account_circle" className="text-on-surface-variant cursor-pointer hover:text-primary transition-opacity" />
          </Link>
        </div>
      </nav>

      <main className="pt-16 pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-margin-mobile md:px-margin-desktop py-24 md:py-32 flex flex-col md:flex-row items-center gap-xl">
          <div className="flex-1 z-10 max-w-2xl">
            <h1 className="text-display-lg mb-md leading-tight">Empowering Public Sector Innovation.</h1>
            <p className="text-body-lg text-on-surface-variant mb-xl">
              Connecting government professionals with world-class mentorship and AI-driven growth pathways to build a more efficient tomorrow.
            </p>
            <div className="flex flex-wrap gap-md">
              <Link
                href="/login"
                className="bg-primary text-on-primary px-xl py-md rounded-lg text-label-md hover:bg-primary/90 transition-all shadow-md transform hover:-translate-y-0.5 active:scale-95"
              >
                Get Started
              </Link>
              <Link
                href="/about"
                className="border border-outline-variant text-on-surface-variant px-xl py-md rounded-lg text-label-md hover:bg-surface-container transition-all"
              >
                Watch Demo
              </Link>
            </div>
          </div>
          <div className="flex-1 relative w-full h-[400px] md:h-[500px]">
            <div className="absolute inset-0 bg-secondary-container/10 rounded-3xl transform rotate-3 scale-95 blur-xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Innovation Hub"
              className="w-full h-full object-cover rounded-3xl shadow-2xl relative z-10 border border-outline-variant"
              src={HERO_IMAGE}
            />
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-margin-mobile md:px-margin-desktop py-20 bg-surface-container-low">
          <div className="max-w-container-max mx-auto">
            <div className="mb-20 text-center">
              <h2 className="text-headline-lg mb-sm">Modern Tools for Modern Governance</h2>
              <p className="text-on-surface-variant text-body-md max-w-xl mx-auto">
                Scalable solutions designed for the unique challenges of the public sector.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div className="md:col-span-2 bg-surface-container-lowest p-xl rounded-2xl border border-outline-variant shadow-sm flex flex-col md:flex-row gap-xl items-center">
                <div className="flex-1">
                  <MaterialIcon name="bolt" className="text-secondary text-4xl mb-md" />
                  <h3 className="text-title-lg mb-sm">Unmatched Efficiency</h3>
                  <p className="text-body-md text-on-surface-variant">
                    Streamline departmental workflows with automated project tracking and shared innovation repositories that eliminate redundant efforts.
                  </p>
                </div>
                <div className="flex-1 h-48 w-full bg-surface-variant rounded-xl overflow-hidden">
                  <div className="p-md space-y-sm">
                    <div className="h-4 w-3/4 bg-on-surface-variant/20 rounded" />
                    <div className="h-4 w-1/2 bg-on-surface-variant/10 rounded" />
                    <div className="h-12 bg-secondary/10 border border-secondary/20 rounded-lg flex items-center px-md gap-sm">
                      <MaterialIcon name="check_circle" className="text-secondary scale-75" />
                      <span className="text-xs font-semibold text-secondary">Efficiency Optimized +24%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-xl rounded-2xl border border-outline-variant shadow-sm flex flex-col">
                <MaterialIcon name="groups" className="text-on-tertiary-container text-4xl mb-md" />
                <h3 className="text-title-lg mb-sm">Mentor Matching</h3>
                <p className="text-body-md text-on-surface-variant">
                  Our proprietary algorithm connects you with mentors based on specific policy domains and career objectives.
                </p>
              </div>
              <div className="bg-surface-container-lowest p-xl rounded-2xl border border-outline-variant shadow-sm flex flex-col">
                <MaterialIcon name="auto_awesome" className="text-secondary text-4xl mb-md" />
                <h3 className="text-title-lg mb-sm">AI Insights</h3>
                <p className="text-body-md text-on-surface-variant">
                  Predictive analytics help identify emerging trends in public policy before they become critical challenges.
                </p>
              </div>
              <div className="md:col-span-2 bg-primary-container text-on-primary-container p-xl rounded-2xl shadow-xl flex flex-col md:flex-row gap-xl items-center overflow-hidden">
                <div className="flex-1">
                  <h3 className="text-title-lg mb-sm text-tertiary-fixed">Government-Grade Security</h3>
                  <p className="text-body-md opacity-80">
                    Full compliance with international standards, ensuring your data remains sovereign and protected at all times.
                  </p>
                </div>
                <div className="flex-1 relative">
                  <MaterialIcon name="verified_user" className="text-[120px] opacity-10 absolute -bottom-10 -right-10" />
                  <div className="p-md bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-sm mb-sm">
                      <div className="w-2 h-2 rounded-full bg-tertiary-fixed" />
                      <span className="text-xs uppercase tracking-widest text-tertiary-fixed">Encryption Active</span>
                    </div>
                    <div className="space-y-xs">
                      <div className="h-1 w-full bg-white/10 rounded-full" />
                      <div className="h-1 w-3/4 bg-white/10 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Assistant Preview */}
        <section className="px-margin-mobile md:px-margin-desktop py-24 max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="inline-flex items-center gap-sm px-md py-xs bg-secondary-container/10 text-secondary rounded-full mb-md">
              <MaterialIcon name="auto_awesome" filled className="text-sm" />
              <span className="text-label-sm">NEXT-GEN AI ASSISTANT</span>
            </div>
            <h2 className="text-headline-lg mb-md">Your Intelligent Partner in Public Policy</h2>
            <p className="text-body-lg text-on-surface-variant mb-xl">
              LW-Connect&apos;s AI doesn&apos;t just answer questions; it understands the complex ecosystem of public administration to guide your professional journey.
            </p>
            <ul className="space-y-md">
              {[
                { title: 'Smart Mentor Recommendations', desc: 'Matches based on shared project histories and skill gaps.' },
                { title: 'Policy Analysis', desc: 'Instant summaries of new directives and their impact on your department.' },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-md">
                  <MaterialIcon name="check_circle" className="text-secondary mt-1" />
                  <div>
                    <p className="text-label-md font-bold">{item.title}</p>
                    <p className="text-body-md text-on-surface-variant">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface-container-highest rounded-3xl p-md ai-glow-strong border border-secondary-container/20">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[500px]">
              <div className="p-md border-b border-outline-variant flex items-center justify-between bg-surface">
                <div className="flex items-center gap-sm">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                    <MaterialIcon name="auto_awesome" filled className="text-on-secondary-container text-sm" />
                  </div>
                  <span className="text-label-md font-bold">LW-Assistant</span>
                </div>
                <MaterialIcon name="more_vert" className="text-on-surface-variant" />
              </div>
              <div className="flex-1 p-md overflow-y-auto space-y-md bg-surface-container-lowest">
                <div className="flex justify-end">
                  <div className="bg-secondary-container text-on-secondary-container p-md rounded-2xl rounded-tr-none max-w-[80%] shadow-sm">
                    <p className="text-sm">I&apos;m looking for a mentor with experience in municipal digital transformation and green energy policy.</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-surface p-md rounded-2xl rounded-tl-none border border-outline-variant max-w-[80%] shadow-sm">
                    <p className="text-sm">
                      Of course. I&apos;ve found 3 mentors matching your criteria. Dr. Elena Vance recently led the &apos;GreenGrid&apos; initiative in District 4. Would you like to view her profile?
                    </p>
                    <div className="mt-md p-sm bg-white rounded-lg border border-outline-variant flex items-center gap-sm">
                      <div className="w-10 h-10 rounded-full bg-surface-dim" />
                      <div className="flex-1">
                        <p className="text-xs font-bold">Dr. Elena Vance</p>
                        <p className="text-[10px] text-on-surface-variant">Digital Policy Expert • 12 years exp.</p>
                      </div>
                      <button className="bg-secondary text-on-secondary text-[10px] px-sm py-1 rounded">View</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-md border-t border-outline-variant bg-surface">
                <div className="flex items-center gap-sm bg-surface-container-low rounded-full px-md py-sm border border-outline-variant">
                  <input className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none" placeholder="Type your request..." type="text" readOnly />
                  <MaterialIcon name="send" className="text-secondary cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mentor Showcase */}
        <section className="px-margin-mobile md:px-margin-desktop py-24 bg-surface-container-low overflow-hidden">
          <div className="max-w-container-max mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-md">
              <div>
                <h2 className="text-headline-lg">Expert Mentor Network</h2>
                <p className="text-on-surface-variant text-body-md max-w-xl">
                  Learn from established leaders who have successfully navigated public innovation.
                </p>
              </div>
              <Link href="/mentors" className="flex items-center gap-xs text-label-md text-secondary hover:underline">
                Browse all mentors <MaterialIcon name="arrow_forward" className="text-sm" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {MENTORS.map((mentor) => (
                <div
                  key={mentor.name}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden group hover:shadow-lg transition-all duration-300"
                >
                  <div className="h-48 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={mentor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={mentor.image}
                    />
                    <div className="absolute top-sm right-sm px-sm py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-xs border border-secondary/20 shadow-sm">
                      <MaterialIcon name="verified" filled className="text-xs text-on-tertiary-container" />
                      <span className="text-[10px] font-bold text-on-tertiary-container">VERIFIED</span>
                    </div>
                  </div>
                  <div className="p-md">
                    <h4 className="text-label-md font-bold">{mentor.name}</h4>
                    <p className="text-xs text-on-surface-variant mb-md">{mentor.title}</p>
                    <div className="flex flex-wrap gap-xs mb-md">
                      {mentor.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-surface-variant text-primary px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href="/mentors"
                      className="block w-full py-2 border border-outline-variant rounded-lg text-label-md text-center hover:bg-primary hover:text-on-primary transition-colors"
                    >
                      Book Session
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics Preview */}
        <section className="px-margin-mobile md:px-margin-desktop py-24 max-w-container-max mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center">
            <div className="lg:col-span-5">
              <h2 className="text-headline-lg mb-md">Data-Driven Transformation</h2>
              <p className="text-body-lg text-on-surface-variant mb-xl">
                Program managers gain high-fidelity visibility into skill progression, departmental impact, and innovation velocity across the entire organization.
              </p>
              <div className="space-y-md">
                {[
                  { icon: 'trending_up', title: 'Impact Metrics', desc: 'Measure ROI of mentorship on policy delivery.' },
                  { icon: 'pie_chart', title: 'Resource Allocation', desc: 'Identify skill shortages in real-time.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-md p-md bg-white rounded-xl border border-outline-variant shadow-sm">
                    <div className="w-12 h-12 bg-tertiary-fixed rounded-lg flex items-center justify-center text-on-tertiary-fixed">
                      <MaterialIcon name={item.icon} />
                    </div>
                    <div>
                      <h5 className="text-label-md font-bold">{item.title}</h5>
                      <p className="text-xs text-on-surface-variant">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="bg-surface-container-high rounded-3xl p-md border border-outline-variant shadow-2xl rotate-1">
                <div className="bg-white rounded-2xl overflow-hidden shadow-inner">
                  <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
                    <h4 className="text-label-md font-bold">Global Innovation Dashboard</h4>
                    <div className="flex gap-sm items-center">
                      <div className="px-3 py-1 bg-surface-variant rounded text-[10px] font-bold">Last 30 Days</div>
                      <MaterialIcon name="filter_list" className="text-sm" />
                    </div>
                  </div>
                  <div className="p-lg space-y-lg">
                    <div className="grid grid-cols-3 gap-md text-center">
                      {[
                        { label: 'Active Mentors', value: '1,240', change: '+12% vs LY' },
                        { label: 'Innovations', value: '482', change: '+45% vs LY' },
                        { label: 'Skill Growth', value: '89%', change: 'Target: 85%' },
                      ].map((stat) => (
                        <div key={stat.label} className="p-md bg-surface-container-low rounded-xl">
                          <p className="text-xs text-on-surface-variant mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold text-primary">{stat.value}</p>
                          <p className="text-[10px] text-on-tertiary-container">{stat.change}</p>
                        </div>
                      ))}
                    </div>
                    <div className="h-48 w-full bg-surface-container-low rounded-xl flex items-end p-md gap-sm">
                      {[50, 75, 66, 100, 50, 85, 60].map((h, i) => (
                        <div key={i} className="flex-1 bg-secondary rounded-t" style={{ height: `${h}%`, opacity: 0.7 + (i % 3) * 0.1 }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-margin-mobile md:px-margin-desktop py-24 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-headline-lg mb-md">Ready to Transform Your Department?</h2>
            <p className="text-body-lg text-on-surface-variant mb-xl">
              Join hundreds of government agencies already using LW-Connect to drive public innovation and career excellence.
            </p>
            <div className="flex justify-center gap-md mb-20 flex-wrap">
              <Link
                href="/login"
                className="bg-primary text-on-primary px-xl py-md rounded-lg text-label-md hover:bg-primary/90 transition-all shadow-md"
              >
                Get Started Now
              </Link>
              <Link
                href="/about"
                className="border border-outline text-on-surface px-xl py-md rounded-lg text-label-md hover:bg-surface-container transition-all"
              >
                Request Proposal
              </Link>
            </div>
            <div className="pt-10 border-t border-outline-variant">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-8">
                Trusted by institutions worldwide
              </p>
              <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {['GOV.UK', 'EU.DATA', 'UNESCO', 'FEDERAL.CONNECT'].map((org) => (
                  <span key={org} className="text-xl font-extrabold tracking-tighter">
                    {org}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface-container shadow-lg rounded-t-xl">
        <Link href="/" className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-2xl px-4 py-1">
          <MaterialIcon name="home" className="text-sm" />
          <span className="text-[10px] font-semibold tracking-wide">Home</span>
        </Link>
        <Link href="/courses" className="flex flex-col items-center justify-center text-on-surface-variant">
          <MaterialIcon name="explore" className="text-sm" />
          <span className="text-[10px] font-semibold tracking-wide">Discover</span>
        </Link>
        <Link href="/ai-assistant" className="flex flex-col items-center justify-center text-on-surface-variant">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white -mt-8 shadow-lg">
            <MaterialIcon name="auto_awesome" filled className="text-xl text-white" />
          </div>
        </Link>
        <Link href="/sessions" className="flex flex-col items-center justify-center text-on-surface-variant">
          <MaterialIcon name="event_available" className="text-sm" />
          <span className="text-[10px] font-semibold tracking-wide">Sessions</span>
        </Link>
        <Link href="/login" className="flex flex-col items-center justify-center text-on-surface-variant">
          <MaterialIcon name="person" className="text-sm" />
          <span className="text-[10px] font-semibold tracking-wide">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
