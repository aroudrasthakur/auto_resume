'use client'

import Link from 'next/link'
import { FileText, Sparkles, Download, Target, Zap, Shield } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                ResumeAI
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login?signup=true"
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Resume Generation</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Create ATS-Optimized
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Resumes in Minutes
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Enter your experience once. Let AI tailor your resume for each job. 
              Generate professional LaTeX PDFs that pass applicant tracking systems.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login?signup=true"
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/40 hover:scale-105"
              >
                Start Building for Free
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-2xl border border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:border-slate-600 transition-all"
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
            <div className="relative rounded-3xl overflow-hidden border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Input Side */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-2">Your Profile Data</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <div className="text-xs text-slate-500 mb-1">Experience</div>
                      <div className="text-slate-300 font-medium">Senior Software Engineer @ Google</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <div className="text-xs text-slate-500 mb-1">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {['Python', 'React', 'AWS', 'ML'].map((skill) => (
                          <span key={skill} className="px-2 py-1 rounded-md bg-violet-500/20 text-violet-300 text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <div className="text-xs text-slate-500 mb-1">Job Description</div>
                      <div className="text-slate-400 text-sm">Looking for a Full Stack Developer...</div>
                    </div>
                  </div>
                </div>

                {/* Output Side */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-3xl opacity-50" />
                  <div className="relative p-6 rounded-xl bg-white shadow-2xl">
                    <div className="text-center mb-4">
                      <div className="text-xl font-bold text-slate-900">John Doe</div>
                      <div className="text-sm text-slate-600">Senior Software Engineer</div>
                    </div>
                    <div className="space-y-3 text-xs text-slate-700">
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">EXPERIENCE</div>
                        <div className="font-medium">Google — Senior Software Engineer</div>
                        <ul className="list-disc list-inside text-slate-600 ml-2">
                          <li>Led development of ML pipeline...</li>
                          <li>Improved system performance by 40%...</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">SKILLS</div>
                        <div className="text-slate-600">Python, React, AWS, Machine Learning...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Our AI understands what recruiters and ATS systems look for, 
              helping you create the perfect resume every time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: 'Job-Specific Tailoring',
                description: 'Paste any job description and watch AI optimize your resume to match the requirements perfectly.',
                gradient: 'from-violet-500 to-purple-500',
              },
              {
                icon: Zap,
                title: 'Instant Generation',
                description: 'Generate professional LaTeX-formatted resumes in seconds, not hours. Focus on applying, not formatting.',
                gradient: 'from-fuchsia-500 to-pink-500',
              },
              {
                icon: FileText,
                title: "Jake's Resume Template",
                description: 'Industry-proven ATS-friendly template used by thousands of successful job seekers.',
                gradient: 'from-cyan-500 to-blue-500',
              },
              {
                icon: Shield,
                title: 'Your Data, Protected',
                description: 'Enterprise-grade encryption keeps your personal information secure. We never share your data.',
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                icon: Download,
                title: 'Multiple Formats',
                description: 'Export your resume as PDF, LaTeX source, or DOCX. Perfect for any application requirement.',
                gradient: 'from-orange-500 to-amber-500',
              },
              {
                icon: Sparkles,
                title: 'AI Content Enhancement',
                description: 'Our AI rewrites bullet points to be impactful and action-oriented while staying truthful to your experience.',
                gradient: 'from-rose-500 to-red-500',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-all hover:bg-slate-800/30"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Three Steps to Your Perfect Resume
            </h2>
            <p className="text-lg text-slate-400">
              Simple, fast, and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Enter Your Details',
                description: 'Add your experience, education, projects, and skills once. Our structured forms make it easy.',
              },
              {
                step: '02',
                title: 'Paste the Job Description',
                description: 'Copy the job posting you want to apply for. Our AI analyzes what the employer is looking for.',
              },
              {
                step: '03',
                title: 'Generate & Download',
                description: 'Get an ATS-optimized resume tailored for the position. Download as PDF and start applying!',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-7xl font-bold text-slate-800/50 mb-4">{item.step}</div>
                <h3 className="text-2xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8 text-slate-700">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Land More Interviews?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who have improved their application success rate with AI-powered resumes.
            </p>
            <Link
              href="/login?signup=true"
              className="inline-flex px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/40 hover:scale-105"
            >
              Create Your Resume Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-400">ResumeAI</span>
            </div>
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} ResumeAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
