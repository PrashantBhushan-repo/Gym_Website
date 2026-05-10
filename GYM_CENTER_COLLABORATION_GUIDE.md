# Gym Center Collaboration Feature - Implementation Guide

## 📋 Overview
This feature enables FitZone (main gym center) to collaborate with other gym centers and show users nearby collaborated gyms based on their location during the contact/signup process.

---

## ✨ Features Implemented

### 1. **Admin Gym Center Management**
- Admins can add new collaborated gym centers
- Store gym center details including:
  - Name, address, city, state, postal code
  - Latitude & longitude coordinates (for distance calculation)
  - Phone, email, contact person
  - Collaboration terms and facility description
  - Active/inactive status

### 2. **User Location-Based Gym Discovery**
- Users enter their location address in the contact form
- System automatically finds nearby collaborated gyms (within 15km radius by default)
- Users can select their preferred gym location when signing up
- Location data is saved with their membership/trainer request

### 3. **Distance Calculation**
- Uses Haversine formula to calculate distance between user and gym centers
- Accurate to ~0.1km precision
- Results sorted by distance (closest first)

### 4. **Database Schema**
- New `CollaboratedGymCenter` collection with all necessary fields
- Updated `PendingRequest` to include:
  - `preferredGymCenter` (ObjectId reference)
  - `userLocationAddress` (user's location)

---

## 🛠️ Backend Setup

### New API Endpoints

#### 1. Add Gym Center (Admin Only)
```
POST /admin/gym-centers
Headers: Authorization required (admin user)
Body: {
  name: string (required),
  address: string (required),
  city: string (required),
  state: string (required),
  postalCode: string (required),
  latitude: number (required, -90 to 90),
  longitude: number (required, -180 to 180),
  phone: string (required),
  email: string (required),
  contactPerson: string (required),
  collaborationTerms: string (required),
  facilityDescription: string (optional)
}
```

#### 2. Find Nearby Gyms (Public)
```
POST /gym-centers/nearby
Body: {
  latitude: number (required),
  longitude: number (required),
  radiusKm: number (optional, default: 15)
}
Response: {
  success: boolean,
  nearbyGyms: [
    {
      ...gymCenter,
      distance: number (in km)
    }
  ]
}
```

#### 3. Get All Collaborated Gyms (Public - for dropdown)
```
GET /gym-centers
Response: {
  success: boolean,
  gymCenters: [...allActiveGyms]
}
```

#### 4. Get All Gym Centers (Admin Only)
```
GET /admin/gym-centers
Headers: Authorization required (admin user)
Response: {
  success: boolean,
  gymCenters: [...allGymsWithDetails]
}
```

#### 5. Update Gym Center (Admin Only)
```
PUT /admin/gym-centers/:gymCenterId
Headers: Authorization required (admin user)
Body: { ...updateFields }
```

#### 6. Delete Gym Center (Admin Only - Soft Delete)
```
DELETE /admin/gym-centers/:gymCenterId
Headers: Authorization required (admin user)
```

### Database Collections

#### CollaboratedGymCenter Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  address: String (required),
  city: String (required),
  state: String (required),
  postalCode: String (required),
  latitude: Number (required),
  longitude: Number (required),
  phone: String (required),
  email: String (required),
  contactPerson: String (required),
  collaborationTerms: String (required),
  facilityDescription: String (optional),
  isActive: Boolean (default: true),
  addedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Frontend Implementation

### Contact Form Enhancements
The ContactForm component now includes:

1. **Location Input Section**
   - Text input for user's location address
   - "Find Nearby Gyms" button to search

2. **Dynamic Gym Selection**
   - Shows nearby gyms if user searches with address
   - Shows all gyms dropdown if no search done
   - Displays distance for nearby gyms

3. **Form Data Structure**
   ```javascript
   {
     // ... existing fields ...
     userLocationAddress: string,
     preferredGymCenter: ObjectId (gym center ID)
   }
   ```

### Admin Dashboard Enhancements
1. **New "Add Gym Center" Button**
   - Dropdown form with all gym center fields
   - Validation for coordinates
   - Success/error notifications

2. **Collaborated Gym Centers Display**
   - Grid view of all active gym centers
   - Shows: Name, city, address, phone, contact person, coordinates, facilities
   - Admin can manage gym centers from here

---

## 🚀 How to Use

### For Admins:

1. **Navigate to Admin Dashboard**
2. **Click "Add Gym Center" button**
3. **Fill in all required fields:**
   - Gym name and address
   - Coordinates (latitude/longitude)
   - Contact details and collaboration terms
4. **Click "Add Gym Center"**
5. **Gym appears in dropdown for users within 15km**

### For Users:

1. **Go to Contact Form**
2. **Fill in basic details** (name, email, etc.)
3. **Enter location address** (e.g., "123 Main St, Nagpur")
4. **Click "Find Nearby Gyms"**
5. **Select preferred gym** from the dropdown
6. **Complete signup process**

---

## 📍 Coordinates Guide

### For Nagpur Area:
- **Fitzone Main (Vint, Nagpur):** 21.1458, 79.0882
- **Example nearby locations:**
  - South Nagpur: 21.1200, 79.0650
  - North Nagpur: 21.1800, 79.1000
  - East Nagpur: 21.1500, 79.1200
  - West Nagpur: 21.1300, 78.9800

### How to Find Coordinates:
1. Use Google Maps
2. Search for the gym location
3. Right-click → copy coordinates
4. Format: latitude, longitude

---

## 🔍 Distance Calculation

### Haversine Formula
The system uses the Haversine formula to calculate great-circle distances:

```javascript
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  // ... formula calculation ...
  return distance; // in km
};
```

### Accuracy
- Accurate to ~0.1km for distances < 100km
- Suitable for finding nearby gyms

### Default Search Radius
- **15km** (can be customized in request)

---

## ⚙️ Configuration

### Modify Search Radius
**Frontend (ContactForm.jsx):**
```javascript
// Change radiusKm parameter in findNearbyGyms function
radiusKm: 15 // Change this value
```

### Modify Coordinates
**Backend (server.js):**
```javascript
// Validation in POST /admin/gym-centers
if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
  // Invalid coordinates
}
```

---

## 🧪 Testing Workflow

### Test Case 1: Add Gym Center
1. Login as admin
2. Go to Admin Dashboard
3. Click "Add Gym Center"
4. Fill in all fields with valid data
5. Verify gym appears in "Collaborated Gym Centers" list

### Test Case 2: Find Nearby Gyms
1. Go to Contact Form
2. Enter location: "21.1500, 79.0900" (near Nagpur)
3. Click "Find Nearby Gyms"
4. Verify nearby gyms appear in dropdown
5. Select a gym and submit

### Test Case 3: Verify Data Storage
1. Submit contact form with gym selection
2. Check admin → Pending Requests
3. Verify `preferredGymCenter` is populated
4. Verify `userLocationAddress` is saved

---

## 🐛 Troubleshooting

### Issue: No gyms found in search
**Solution:**
- Verify gym center coordinates are correct
- Check search radius (default 15km)
- Ensure gym is marked as active (`isActive: true`)

### Issue: Coordinates validation error
**Solution:**
- Latitude must be between -90 and 90
- Longitude must be between -180 and 180
- Use decimal format (e.g., 21.1458)

### Issue: Admin can't add gym center
**Solution:**
- Verify you're logged in as admin
- Check all required fields are filled
- Verify coordinates are valid numbers

---

## 📊 Data Flow

```
User fills contact form
        ↓
User enters location address
        ↓
System calculates coordinates (demo: uses fixed Nagpur coords)
        ↓
POST /gym-centers/nearby with coordinates
        ↓
Backend queries all gym centers
        ↓
Backend calculates distance for each gym (Haversine formula)
        ↓
Filters gyms within 15km radius
        ↓
Returns sorted list (nearest first)
        ↓
Frontend displays dropdown with nearby gyms
        ↓
User selects gym and submits form
        ↓
Selected gym ID saved in PendingRequest
        ↓
Admin approves request with gym location info
```

---

## 🔐 Security Notes

1. **Admin Only Operations**
   - Adding gym centers requires admin authentication
   - Deleting gyms (soft delete) requires admin auth
   - Updating gyms requires admin auth

2. **Public Endpoints**
   - Gym list is public (no sensitive info exposed)
   - Nearby search is public
   - Collaboration terms are hidden from public endpoint

3. **Data Validation**
   - All coordinates validated for valid ranges
   - Email format validated
   - Phone number format should be validated (add if needed)

---

## 🎯 Future Enhancements

1. **Real Geocoding API Integration**
   - Replace demo coordinates with actual Google Maps API
   - Get real address → coordinates conversion

2. **Image Support**
   - Add gym center photos
   - Display facility images

3. **Ratings & Reviews**
   - Allow members to rate gym centers
   - Display average ratings

4. **Operating Hours**
   - Store gym center operating hours
   - Show hours in user interface

5. **Services/Amenities**
   - List specific services offered (yoga, CrossFit, etc.)
   - Filter gyms by services

6. **Membership Transfer**
   - Allow members to transfer to nearby gyms
   - Cross-gym membership privileges

---

## 📞 Support

For issues or questions, contact the development team.
