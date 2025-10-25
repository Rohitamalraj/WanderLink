'use client'

import { useState } from 'react'
import { X, Plus, MapPin, Calendar, DollarSign, Users } from 'lucide-react'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget_per_person: '',
    max_members: 3,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget_per_person: parseInt(formData.budget_per_person),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create group')
      }

      alert('🎉 Group created successfully! Others can now join your trip.')
      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        name: '',
        destination: '',
        start_date: '',
        end_date: '',
        budget_per_person: '',
        max_members: 3,
      })
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-400 to-pink-400 p-6 border-b-4 border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white border-2 border-black">
                <Plus size={24} className="text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-black">CREATE A GROUP</h2>
                <p className="text-black font-bold">Start your travel adventure (Max 3 people)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white border-2 border-black hover:bg-gray-100 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-black text-black mb-2">
              GROUP NAME *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Tokyo Cherry Blossom Adventure"
              className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-black text-black mb-2">
              <MapPin className="inline mr-1" size={16} />
              DESTINATION *
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              required
              placeholder="e.g., Tokyo, Japan"
              className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-black text-black mb-2">
                <Calendar className="inline mr-1" size={16} />
                START DATE *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-black mb-2">
                <Calendar className="inline mr-1" size={16} />
                END DATE *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                min={formData.start_date || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-black text-black mb-2">
              <DollarSign className="inline mr-1" size={16} />
              BUDGET PER PERSON (USD) *
            </label>
            <input
              type="number"
              name="budget_per_person"
              value={formData.budget_per_person}
              onChange={handleChange}
              required
              min="100"
              max="100000"
              placeholder="e.g., 1200"
              className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-sm text-gray-600 font-semibold mt-2">
              This is the estimated cost per person for the entire trip
            </p>
          </div>

          {/* Max Members */}
          <div>
            <label className="block text-sm font-black text-black mb-2">
              <Users className="inline mr-1" size={16} />
              MAX GROUP SIZE *
            </label>
            <select
              name="max_members"
              value={formData.max_members}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="2">2 People</option>
              <option value="3">3 People (Maximum)</option>
            </select>
            <p className="text-sm text-gray-600 font-semibold mt-2">
              Including you! Max 3 people per group for better matching.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-100 border-2 border-black p-4">
            <p className="text-sm font-bold text-black">
              💡 <strong>How it works:</strong> After creating your group, others can find and join through 
              "Find My Matches". You'll see join requests and can accept compatible travelers!
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-gray-300 border-4 border-black font-black text-lg hover:bg-gray-400 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-400 to-pink-400 border-4 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'CREATING...' : 'CREATE GROUP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
