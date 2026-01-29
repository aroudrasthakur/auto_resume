'use client'

import { useAuth } from '@/lib/auth-context'
import { User, Mail, Calendar, UserCircle } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile</h1>
        <p className="text-slate-600">View and manage your account information</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
              {user?.nickname?.charAt(0).toUpperCase() || user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">
                {user?.nickname || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.name) || 'User'}
              </h2>
              {user?.email && (
                <p className="text-white/80 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="px-6 py-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h3>
          <div className="space-y-4">
            {user?.nickname && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Nickname</p>
                  <p className="text-base font-semibold text-slate-900">{user.nickname}</p>
                </div>
              </div>
            )}

            {(user?.firstName || user?.lastName) && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                <div className="w-10 h-10 rounded-full bg-fuchsia-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-fuchsia-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Full Name</p>
                  <p className="text-base font-semibold text-slate-900">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || user.lastName || 'Not provided'
                    }
                  </p>
                </div>
              </div>
            )}

            {user?.email && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Email Address</p>
                  <p className="text-base font-semibold text-slate-900">{user.email}</p>
                </div>
              </div>
            )}

            {user?.sub && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">User ID</p>
                  <p className="text-base font-mono text-sm text-slate-600 break-all">{user.sub}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Account information is managed through AWS Cognito. To update your profile, please contact support or use the Cognito console.
          </p>
        </div>
      </div>
    </div>
  )
}

