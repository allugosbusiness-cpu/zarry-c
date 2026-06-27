import Link from "next/link";

export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Unsubscribed</h1>
        <p className="text-white/60 mb-8">
          You've been successfully unsubscribed from Zarry C email notifications. 
          You'll no longer receive emails about new music, tours, or merch drops.
        </p>
        <p className="text-white/40 text-sm mb-8">
          If you change your mind, you can re-subscribe anytime on the Fan Club page.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}