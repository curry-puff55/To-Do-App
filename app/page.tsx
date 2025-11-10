import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#111827] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-semibold">SL</span>
            </div>
            <span className="text-[#111827] font-semibold text-lg">SharedList</span>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Value Proposition */}
          <div className="mb-12">
            <h1 className="text-5xl font-semibold text-[#111827] mb-6 leading-tight">
              Turn inspiration into action
            </h1>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
              Transform online guides and timelines into structured, shareable plans.
              No gamification. Just calm, clear planning for real life.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link
              href="/explore"
              className="px-8 py-4 bg-[#111827] text-white rounded-[14px] font-medium hover:bg-[#1f2937] transition-colors min-w-[200px] text-center"
            >
              Explore Templates
            </Link>
            <Link
              href="/dashboard/new"
              className="px-8 py-4 bg-white text-[#111827] border-2 border-[#111827] rounded-[14px] font-medium hover:bg-[#F9FAFB] transition-colors min-w-[200px] text-center"
            >
              Create a List
            </Link>
          </div>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {/* Template-Based Lists */}
            <div className="bg-white p-8 rounded-[16px] border border-gray-200 text-left hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#F9FAFB] rounded-[12px] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#111827] mb-2">
                Template Library
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Browse, clone, and customize community templates for moving, travel, events, and more.
              </p>
            </div>

            {/* Timeline View */}
            <div className="bg-white p-8 rounded-[16px] border border-gray-200 text-left hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#F9FAFB] rounded-[12px] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#111827] mb-2">
                Timeline Planning
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Set an anchor date and tasks auto-calculate. See what matters, when it matters.
              </p>
            </div>

            {/* Share & Discover */}
            <div className="bg-white p-8 rounded-[16px] border border-gray-200 text-left hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#F9FAFB] rounded-[12px] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#111827] mb-2">
                Share & Remix
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Publish lists to the community or fork others' plans. Reuse over reinvention.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-sm text-[#6B7280]">
            Built for calm, clear planning. No points. No streaks. Just what matters.
          </p>
        </div>
      </footer>
    </div>
  );
}
