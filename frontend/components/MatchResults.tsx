'use client'

import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface Match {
  user_id: string
  compatibility_score: number
  compatibility?: {
    overall_score: number
    destination_match: number
    budget_match: number
    activity_match: number
    reasoning: string
    strengths: string[]
    concerns: string[]
  }
}

interface MatchResultsProps {
  matches: Match[]
  asiPowered: boolean
  loading?: boolean
}

function CompatibilityBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(value)}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  )
}

function CircularProgress({ value }: { value: number }) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative w-16 h-16">
      <svg className="transform -rotate-90 w-16 h-16">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-blue-600 transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold">{Math.round(value)}%</span>
      </div>
    </div>
  )
}

export function MatchResults({ matches, asiPowered, loading = false }: MatchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-center text-muted-foreground">Finding your perfect travel companions...</p>
      </div>
    )
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <p className="text-muted-foreground">No matches found yet. Adjust your preferences or try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {asiPowered && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <p className="font-semibold">AI-Powered Matches</p>
            </div>
            <p className="text-sm text-blue-100 mt-1">
              Analyzed by ASI:One for intelligent compatibility
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {matches.map((match, index) => (
          <Card key={match.user_id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>Traveler #{index + 1}</span>
                    <Badge variant="secondary" className="ml-2">
                      {match.compatibility_score}% Match
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    ID: {match.user_id.substring(0, 8)}...
                  </p>
                </div>
                <CircularProgress value={match.compatibility_score} />
              </div>
            </CardHeader>

            {match.compatibility && (
              <CardContent className="space-y-4">
                {/* AI Reasoning */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-700">
                    {match.compatibility.reasoning}
                  </p>
                </div>

                {/* Compatibility Breakdown */}
                <div className="grid grid-cols-1 gap-3">
                  <CompatibilityBar 
                    label="Destination Compatibility" 
                    value={match.compatibility.destination_match}
                  />
                  <CompatibilityBar 
                    label="Budget Compatibility" 
                    value={match.compatibility.budget_match}
                  />
                  <CompatibilityBar 
                    label="Activity Compatibility" 
                    value={match.compatibility.activity_match}
                  />
                </div>

                {/* Strengths */}
                {match.compatibility.strengths && match.compatibility.strengths.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-green-700">Strengths</p>
                    </div>
                    <ul className="space-y-1 ml-6">
                      {match.compatibility.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-gray-600 list-disc">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Concerns */}
                {match.compatibility.concerns && match.compatibility.concerns.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <p className="text-sm font-medium text-orange-700">Considerations</p>
                    </div>
                    <ul className="space-y-1 ml-6">
                      {match.compatibility.concerns.map((concern, i) => (
                        <li key={i} className="text-sm text-gray-600 list-disc">
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    View Profile
                  </button>
                  <button className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                    Send Message
                  </button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
