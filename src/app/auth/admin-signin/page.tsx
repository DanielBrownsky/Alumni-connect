import AdminSignInForm from '@/components/auth/AdminSignInForm'
import Link from 'next/link'

export default function AdminSignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-xl rounded-2xl p-8 space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Alumni Connect</h1>
            </Link>
            <p className="mt-2 text-sm text-red-600 font-medium">Admin Portal</p>
          </div>
          <AdminSignInForm />
        </div>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          <Link 
            href="/auth/signin" 
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            ← Back to regular sign in
          </Link>
        </p>
      </div>
    </div>
  )
}