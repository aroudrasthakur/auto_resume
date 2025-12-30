'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function ResumeStatusPage() {
  const params = useParams()
  const resumeId = params.id as string
  const [status, setStatus] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/resumes/${resumeId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )
        if (response.ok) {
          const data = await response.json()
          setStatus(data)

          if (data.status === 'DONE') {
            // Fetch files
            const filesResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/v1/resumes/${resumeId}/files`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            )
            if (filesResponse.ok) {
              const filesData = await filesResponse.json()
              setFiles(filesData)
            }
          } else if (data.status !== 'DONE' && data.status !== 'FAILED') {
            // Poll every 2 seconds
            setTimeout(fetchStatus, 2000)
          }
        }
      } catch (error) {
        console.error('Error fetching status:', error)
      }
    }

    fetchStatus()
  }, [resumeId])

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Resume Status</h1>
      <div className="bg-white shadow rounded-lg p-6">
        {status && (
          <div>
            <p className="text-lg font-medium">
              Status: <span className="capitalize">{status.status}</span>
            </p>
            {status.status === 'DONE' && files.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-medium mb-2">Download Files</h2>
                <ul className="space-y-2">
                  {files.map((file) => (
                    <li key={file.id}>
                      <a
                        href={file.download_url}
                        download
                        className="text-blue-600 hover:underline"
                      >
                        Download {file.type}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {status.status === 'FAILED' && (
              <p className="text-red-600 mt-2">
                Error: {status.failure_reason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

