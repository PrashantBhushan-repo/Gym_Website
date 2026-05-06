# Admin Setup Guide

## Admin User Credentials

### Email 1: prashant.bhushan.tech@gmail.com
### Email 2: prashant189041830@gmail.com
### Password: 130036

## Option 1: Using MongoDB Atlas Web Console (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Navigate to **Cluster** → **Collections** → **gym_website** → **users**
3. Click **Insert Document**
4. Add the following JSON:

```json
{
  "_id": {"$oid": "507f1f77bcf86cd799439011"},
  "googleId": null,
  "displayName": "Prashant Admin",
  "email": "prashant.bhushan.tech@gmail.com",
  "picture": "",
  "password": "$2b$10$YOUR_BCRYPT_HASH_HERE",
  "role": "admin",
  "isVerified": true,
  "createdAt": {"$date": "2024-01-01T00:00:00Z"}
}
```

5. Repeat for the second email

## Option 2: Using Admin Dashboard After Deployment

1. Deploy the application to Vercel and Render
2. Create a temporary user account
3. Manually change the role to "admin" in MongoDB Atlas:
   - Open Collections → users
   - Find your user document
   - Edit and change `"role": "member"` to `"role": "admin"`

## Option 3: Using Login Form

1. Go to `/login` on your deployed site
2. Select "Admin Login"
3. Enter the credentials:
   - Email: `prashant.bhushan.tech@gmail.com`
   - Password: `130036`
4. If the system prompts for admin setup, follow the instructions

## Testing Admin Dashboard

Once logged in as admin:
- View Dashboard Stats (Members, Trainers, Classes, Revenue)
- Add New Trainer
- Add New Member
- Create Classes
- View Recent Signups
- View Contact Form Submissions
- View System Information

## Collections Structure

The application uses a single collection for all users:
- **Collection**: `users`
- **Fields**: 
  - `displayName`: User's display name
  - `email`: User's email (unique)
  - `password`: Bcrypt hashed password
  - `role`: 'admin', 'trainer', or 'member'
  - `isVerified`: Boolean status
  - `createdAt`: Timestamp

## Notes

- Both admin emails have the same role and access level
- Password: `130036` (same for both accounts)
- The system supports Google OAuth as an alternative login method
- All users (member, trainer, admin) are stored in the same collection with role-based access control
