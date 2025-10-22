'use client'

import { useState } from 'react'
import { Camera, CheckCircle, AlertCircle, Upload, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface VerificationResult {
  verified: boolean
  confidence: number
  verdict: string
  reasoning: string
  concerns: string[]
  timestamp: string
}

interface TripVerificationProps {
  tripId: string
  userId: string
  destination: string
  onVerificationComplete?: (result: VerificationResult) => void
}

export function TripVerification({ 
  tripId, 
  userId, 
  destination,
  onVerificationComplete 
}: TripVerificationProps) {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setError(null)
      setResult(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVerify = async () => {
    if (!image) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        
        // Call verification API
        const response = await fetch('/api/verify/trip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trip_id: tripId,
            user_id: userId,
            destination: destination,
            image_base64: base64
          })
        })
        
        if (!response.ok) {
          throw new Error('Verification failed')
        }
        
        const data: VerificationResult = await response.json()
        setResult(data)
        
        if (onVerificationComplete) {
          onVerificationComplete(data)
        }
        
        setLoading(false)
      }
      
      reader.onerror = () => {
        setError('Failed to read image file')
        setLoading(false)
      }
      
      reader.readAsDataURL(image)
    } catch (err: any) {
      console.error('Verification error:', err)
      setError(err.message || 'Failed to verify trip')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Image Upload */}
      {!result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Upload Trip Photo
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload a photo from your trip to {destination} for AI verification
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="trip-image"
                disabled={loading}
              />
              <label 
                htmlFor="trip-image" 
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {imagePreview ? (
                  <div className="space-y-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-full max-h-64 rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground">
                      Click to change photo
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </>
                )}
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {image && (
              <Button 
                onClick={handleVerify} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying with AI...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Trip Completion
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Verification Result */}
      {result && (
        <Card className={
          result.verified 
            ? 'bg-green-50 border-green-200' 
            : 'bg-orange-50 border-orange-200'
        }>
          <CardHeader>
            <div className="flex items-center gap-3">
              {result.verified ? (
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              )}
              <div className="flex-1">
                <CardTitle className={result.verified ? 'text-green-900' : 'text-orange-900'}>
                  {result.verdict}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Verified by GPT-4o Vision AI
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* AI Reasoning */}
            <div className="p-3 bg-white rounded-lg border">
              <p className="text-sm text-gray-700">
                {result.reasoning}
              </p>
            </div>

            {/* Confidence Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Confidence Score</span>
                <span className="font-bold">{Math.round(result.confidence * 100)}%</span>
              </div>
              <Progress 
                value={result.confidence * 100} 
                className="h-3"
              />
            </div>

            {/* Concerns */}
            {result.concerns && result.concerns.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <p className="text-sm font-medium text-orange-900">Concerns Identified</p>
                </div>
                <ul className="space-y-1 ml-6">
                  {result.concerns.map((concern, i) => (
                    <li key={i} className="text-sm text-gray-600 list-disc">
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Verified: {new Date(result.timestamp).toLocaleString()}
            </div>

            {/* Action Buttons */}
            {result.verified && (
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  Claim Rewards
                </Button>
                <Button variant="outline" className="flex-1">
                  Share Achievement
                </Button>
              </div>
            )}

            {/* Try Again Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setResult(null)
                setImage(null)
                setImagePreview(null)
              }}
            >
              Verify Another Photo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
