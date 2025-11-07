import { Suspense } from 'react';
import Link from 'next/link';

function ErrorContent({ searchParams }: { searchParams: { error?: string } }) {
  const error = searchParams.error;

  const getErrorDetails = () => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Server Error',
          message: 'There is a problem with the server configuration.',
          suggestion: 'Please try again later or contact support.',
        };
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to sign in.',
          suggestion: 'If you believe this is an error, please contact the administrator.',
        };
      case 'Verification':
        return {
          title: 'Verification Failed',
          message: 'The sign-in link is invalid or has expired.',
          suggestion: 'Please request a new sign-in link.',
        };
      case 'EmailConflict':
        return {
          title: 'Email Already in Use',
          message: 'This email is associated with an opponent profile created by another user.',
          suggestion: 'To claim this profile, ask the creator to send you an invite link via QR code. If you need help, please contact the administrator.',
          contactAdmin: true,
        };
      default:
        return {
          title: 'Sign In Error',
          message: 'An error occurred during sign in.',
          suggestion: 'Please try again or contact support if the problem persists.',
        };
    }
  };

  const details = getErrorDetails();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">{details.title}</h1>
        <p className="text-gray-600 text-center mb-4">{details.message}</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            💡 <strong>Suggestion:</strong> {details.suggestion}
          </p>
        </div>

        {details.contactAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-900 font-semibold mb-2">Need Help?</p>
            <p className="text-sm text-yellow-800">
              Contact the administrator at{' '}
              <a href="mailto:a13158y@gmail.com" className="underline">
                a13158y@gmail.com
              </a>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full h-12 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center leading-[3rem]"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="block w-full h-12 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center leading-[3rem]"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent searchParams={searchParams} />
    </Suspense>
  );
}

