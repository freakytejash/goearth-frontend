const BASE = import.meta.env.VITE_API_URL || ''

export const api = {
  // Packages
  getPackages: (type) =>
    fetch(`${BASE}/api/packages${type && type !== 'all' ? `?type=${type}` : ''}`).then(r => r.json()),

  getPackage: (id) =>
    fetch(`${BASE}/api/packages/${id}`).then(r => r.json()),

  // B2B Enquiries
  submitEnquiry: (data) =>
    fetch(`${BASE}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Bookings
  submitBooking: (data) =>
    fetch(`${BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // AI Chat
  chat: (messages) =>
    fetch(`${BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    }).then(r => r.json()),

  // Stays
  getStays: () =>
    fetch(`${BASE}/api/stays`).then(r => r.json()),

  // Destinations
  getDestinations: () =>
    fetch(`${BASE}/api/destinations`).then(r => r.json()),
}
