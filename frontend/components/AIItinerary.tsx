'use client'

import { Brain, Lightbulb, CheckCircle, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ItineraryDay {
  day: number
  title: string
  activities: string[]
  budget_range: string
}

interface AIItineraryProps {
  itinerary: ItineraryDay[]
  asiPowered: boolean
  recommendations?: string[]
  estimatedCost?: string
  loading?: boolean
}

export function AIItinerary({ 
  itinerary, 
  asiPowered, 
  recommendations = [], 
  estimatedCost,
  loading = false 
}: AIItineraryProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
        <p className="text-center text-muted-foreground">
          AI is crafting your perfect itinerary...
        </p>
      </div>
    )
  }

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <p className="text-muted-foreground">
          No itinerary available. Try generating one with your preferences.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Badge */}
      {asiPowered && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <p className="font-semibold">AI-Generated Itinerary</p>
            </div>
            <p className="text-sm text-purple-100 mt-1">
              Personalized by ASI:One based on your preferences and interests
            </p>
          </CardContent>
        </Card>
      )}

      {/* Total Cost */}
      {estimatedCost && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Estimated Total Cost</span>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {estimatedCost}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Itinerary */}
      <div className="space-y-4">
        {itinerary.map((day) => (
          <Card key={day.day} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{day.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {day.budget_range}
                  </p>
                </div>
                <Badge variant="outline">Day {day.day}</Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3">
                {day.activities.map((activity, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{activity}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pro Tips */}
      {recommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Pro Tips & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Download/Share Actions */}
      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
          Download Itinerary
        </button>
        <button className="flex-1 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium">
          Share with Friends
        </button>
      </div>
    </div>
  )
}
