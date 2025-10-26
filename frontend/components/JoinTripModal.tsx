'use client'

import { useState } from 'react'
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react'

interface JoinTripModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (preferences: UserPreferences) => void
}

export interface UserPreferences {
  // Basic info
  name: string
  email: string
  age?: number
  gender?: string
  location?: string

  // Travel preferences
  preferred_destinations: string[]
  budget_min: number
  budget_max: number
  travel_pace: 'relaxed' | 'moderate' | 'packed'
  group_size_preference?: string

  // Interests
  interests: string[]

  // Additional
  accommodation_types: string[]
  dietary_restrictions: string[]
  languages_spoken: string[]
  travel_experience: 'beginner' | 'intermediate' | 'expert'
  smoking_preference?: string
  drinking_preference?: string
}

const INTERESTS_OPTIONS = [
  'Adventure',
  'Beach',
  'Culture',
  'Food',
  'History',
  'Nature',
  'Nightlife',
  'Photography',
  'Shopping',
  'Sports',
  'Wellness',
  'Wildlife',
]

const ACCOMMODATION_OPTIONS = ['Hostel', 'Hotel', 'Airbnb', 'Resort', 'Boutique']

const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Italian', 'Portuguese']

export default function JoinTripModal({ isOpen, onClose, onSubmit }: JoinTripModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<UserPreferences>({
    name: '',
    email: '',
    age: undefined,
    gender: '',
    location: '',
    preferred_destinations: [],
    budget_min: 500,
    budget_max: 3000,
    travel_pace: 'moderate',
    group_size_preference: 'small',
    interests: [],
    accommodation_types: [],
    dietary_restrictions: [],
    languages_spoken: ['English'],
    travel_experience: 'intermediate',
    smoking_preference: 'no',
    drinking_preference: 'socially',
  })

  const [destinationInput, setDestinationInput] = useState('')

  if (!isOpen) return null

  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    onSubmit(formData)
    onClose()
  }

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter((i) => i !== item)
    }
    return [...array, item]
  }

  const addDestination = () => {
    if (destinationInput.trim() && !formData.preferred_destinations.includes(destinationInput.trim())) {
      setFormData({
        ...formData,
        preferred_destinations: [...formData.preferred_destinations, destinationInput.trim()],
      })
      setDestinationInput('')
    }
  }

  const removeDestination = (dest: string) => {
    setFormData({
      ...formData,
      preferred_destinations: formData.preferred_destinations.filter((d) => d !== dest),
    })
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.email
      case 2:
        return formData.preferred_destinations.length > 0 && formData.budget_max > 0
      case 3:
        return formData.interests.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 border-b-4 border-black p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-black">JOIN A TRIP</h2>
              <p className="text-black font-bold mt-1">
                Step {step} of {totalSteps}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 border-2 border-black bg-white hover:bg-red-400 transition-colors"
            >
              <X size={24} className="text-black" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 border-2 border-black ${
                  s <= step ? 'bg-black' : 'bg-white'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-black mb-4">📋 Basic Information</h3>
                <p className="text-gray-700 font-bold mb-6">Tell us about yourself</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-black font-black mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-black font-black mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-black font-black mb-2">Age</label>
                    <input
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                      className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                      placeholder="25"
                      min="18"
                      max="99"
                    />
                  </div>

                  <div>
                    <label className="block text-black font-black mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-white"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-black font-black mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Travel Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-black mb-4">✈️ Travel Preferences</h3>
                <p className="text-gray-700 font-bold mb-6">Where and how do you like to travel?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-black font-black mb-2">Preferred Destinations *</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDestination())}
                      className="flex-1 p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                      placeholder="Tokyo, Paris, Bali..."
                    />
                    <button
                      onClick={addDestination}
                      className="px-6 py-3 bg-green-400 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      ADD
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferred_destinations.map((dest) => (
                      <div
                        key={dest}
                        className="px-4 py-2 bg-yellow-300 border-2 border-black font-bold flex items-center gap-2"
                      >
                        {dest}
                        <button onClick={() => removeDestination(dest)} className="hover:text-red-600">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-black font-black mb-2">
                    Budget Range: ${formData.budget_min} - ${formData.budget_max}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700">Min Budget</label>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={formData.budget_min}
                        onChange={(e) => setFormData({ ...formData, budget_min: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700">Max Budget</label>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={formData.budget_max}
                        onChange={(e) => setFormData({ ...formData, budget_max: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-black font-black mb-2">Travel Pace</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['relaxed', 'moderate', 'packed'] as const).map((pace) => (
                      <button
                        key={pace}
                        onClick={() => setFormData({ ...formData, travel_pace: pace })}
                        className={`p-4 border-4 border-black font-black uppercase transition-all ${
                          formData.travel_pace === pace
                            ? 'bg-blue-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {pace}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-black font-black mb-2">Travel Experience</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['beginner', 'intermediate', 'expert'] as const).map((exp) => (
                      <button
                        key={exp}
                        onClick={() => setFormData({ ...formData, travel_experience: exp })}
                        className={`p-4 border-4 border-black font-black uppercase transition-all ${
                          formData.travel_experience === exp
                            ? 'bg-purple-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-black mb-4">🎯 Interests & Activities</h3>
                <p className="text-gray-700 font-bold mb-6">What do you enjoy doing while traveling?</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {INTERESTS_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        interests: toggleArrayItem(formData.interests, interest.toLowerCase()),
                      })
                    }
                    className={`p-4 border-4 border-black font-black transition-all ${
                      formData.interests.includes(interest.toLowerCase())
                        ? 'bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {formData.interests.includes(interest.toLowerCase()) && (
                      <Check className="inline mr-2" size={20} />
                    )}
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Additional Preferences */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-black mb-4">⚙️ Additional Preferences</h3>
                <p className="text-gray-700 font-bold mb-6">Help us find your perfect match</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-black font-black mb-2">Accommodation Types</label>
                  <div className="grid grid-cols-3 gap-4">
                    {ACCOMMODATION_OPTIONS.map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            accommodation_types: toggleArrayItem(formData.accommodation_types, type.toLowerCase()),
                          })
                        }
                        className={`p-3 border-4 border-black font-bold transition-all ${
                          formData.accommodation_types.includes(type.toLowerCase())
                            ? 'bg-orange-400'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-black font-black mb-2">Languages Spoken</label>
                  <div className="grid grid-cols-4 gap-2">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            languages_spoken: toggleArrayItem(formData.languages_spoken, lang),
                          })
                        }
                        className={`p-2 border-2 border-black font-bold text-sm transition-all ${
                          formData.languages_spoken.includes(lang)
                            ? 'bg-blue-300'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-black font-black mb-2">Smoking</label>
                    <select
                      value={formData.smoking_preference}
                      onChange={(e) => setFormData({ ...formData, smoking_preference: e.target.value })}
                      className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-white"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                      <option value="socially">Socially</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-black font-black mb-2">Drinking</label>
                    <select
                      value={formData.drinking_preference}
                      onChange={(e) => setFormData({ ...formData, drinking_preference: e.target.value })}
                      className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-white"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                      <option value="socially">Socially</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-black font-black mb-2">Dietary Restrictions (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.dietary_restrictions.join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dietary_restrictions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                    placeholder="Vegetarian, Vegan, Gluten-free..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 border-t-4 border-black p-6 flex justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-3 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 ${
              step === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white'
            }`}
          >
            <ArrowLeft size={20} />
            BACK
          </button>

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-3 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 ${
                canProceed() ? 'bg-blue-400' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              NEXT
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
            >
              <Check size={20} />
              FIND MY MATCHES!
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
