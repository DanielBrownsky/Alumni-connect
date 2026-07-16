'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface StudentProfile {
  id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  department: string
  graduation_year: number
  skills: string[]
  bio?: string
  linkedin_url?: string
  github_url?: string
  profile_picture?: string
}

export default function StudentNetworkPage() {
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [graduationYearFilter, setGraduationYearFilter] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [searchTerm, departmentFilter, graduationYearFilter, students])

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('first_name', { ascending: true })

    if (error) {
      console.error('Error fetching students:', error)
    } else {
      setStudents(data || [])
      setFilteredStudents(data || [])
    }
    setLoading(false)
  }

  const filterStudents = () => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (departmentFilter) {
      filtered = filtered.filter((student) =>
        student.department.toLowerCase().includes(departmentFilter.toLowerCase())
      )
    }

    if (graduationYearFilter) {
      filtered = filtered.filter(
        (student) => student.graduation_year.toString() === graduationYearFilter
      )
    }

    setFilteredStudents(filtered)
  }

  const departments = Array.from(new Set(students.map((s) => s.department)))
  const graduationYears = Array.from(new Set(students.map((s) => s.graduation_year))).sort((a, b) => b - a)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/dashboard/alumni" className="flex items-center text-gray-700 hover:text-gray-900">
                <span className="md:hidden text-2xl">←</span>
                <span className="hidden md:inline px-4 py-2">← Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Student Network</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Browse Students</h2>
            <p className="mt-2 text-gray-600">
              Connect with current students and discover future talent.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  placeholder="Type department name..."
                  list="departments"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <datalist id="departments">
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-2">
                  Graduation Year
                </label>
                <input
                  type="text"
                  id="graduationYear"
                  value={graduationYearFilter}
                  onChange={(e) => setGraduationYearFilter(e.target.value)}
                  placeholder="Type graduation year..."
                  list="graduationYears"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <datalist id="graduationYears">
                  {graduationYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>

          {/* Student cards */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No students found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        {student.profile_picture ? (
                          <img
                            src={student.profile_picture}
                            alt={`${student.first_name} ${student.last_name}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                        )}
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </h3>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {student.department}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Class of {student.graduation_year}
                      </div>
                    </div>

                    {student.skills && student.skills.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {student.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {student.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{student.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {student.bio && (
                      <p className="mt-4 text-sm text-gray-600 line-clamp-2">{student.bio}</p>
                    )}

                    <div className="mt-4 flex space-x-2">
                      <Link
                        href={`mailto:${student.email}`}
                        className="flex-1 bg-purple-600 text-white text-center py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Contact
                      </Link>
                      {student.linkedin_url && (
                        <a
                          href={student.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
