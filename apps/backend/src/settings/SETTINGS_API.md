# Settings API Reference

**Base URL:** `http://localhost:3001` (or your `API_BASE`)

**Auth:** All endpoints require `Authorization: Bearer <JWT_TOKEN>` header.

**Database:** PostgreSQL  
**ORM:** Prisma

---

## Endpoints

### GET /settings
Get current user's settings and profile.

**Response (200):**
```json
{
  "email": "user@example.com",
  "twoFA": false,
  "emailNotifications": true,
  "profileVisibility": true,
  "availability": true,
  "pendingEmail": null,
  "profile": {
    "name": "John Doe",
    "headline": null,
    "bio": "Freelance developer",
    "timezone": "America/New_York",
    "country": "USA",
    "city": "New York",
    "state": "NY",
    "availability": true,
    "avatarUrl": "/uploads/avatars/xxx.jpg"
  }
}
```

---

### PUT /settings/profile
Update profile (name, bio, location, timezone).

**Request:**
```json
{
  "name": "John Doe",
  "bio": "Full-stack developer with 5 years experience",
  "country": "USA",
  "city": "New York",
  "state": "NY",
  "timezone": "America/New_York"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "name": "John Doe",
    "bio": "Full-stack developer...",
    "timezone": "America/New_York",
    "country": "USA",
    "city": "New York",
    "state": "NY"
  }
}
```

---

### PUT /settings/password
Change password (requires current password).

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePass1"
}
```

**Validation:**
- `newPassword`: min 8 chars, at least one letter and one number
- `newPassword` must differ from `currentPassword`

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

---

### PUT /settings/email
Request email change (sends verification flow).

**Request:**
```json
{
  "newEmail": "newemail@example.com",
  "password": "currentPassword123"
}
```

**Response (200):**
```json
{
  "message": "Verification email sent. Check your inbox to confirm the new email."
}
```

**Note:** Backend stores `pendingEmail` and `emailVerificationToken`. Integrate an email service (e.g. SendGrid, Nodemailer) to send the verification link. Use `POST /settings/email/verify` with the token from the link.

---

### POST /settings/email/verify
Verify new email with token from verification link.

**Request:**
```json
{
  "token": "hex-token-from-email-link"
}
```

**Response (200):**
```json
{
  "message": "Email updated successfully",
  "email": "newemail@example.com"
}
```

---

### PUT /settings
Update notification and privacy toggles.

**Request:**
```json
{
  "twoFA": false,
  "emailNotifications": true,
  "profileVisibility": true,
  "availability": true
}
```

**Response (200):**
```json
{
  "message": "Settings updated successfully",
  "settings": {
    "twoFA": false,
    "emailNotifications": true,
    "profileVisibility": true,
    "availability": true
  }
}
```

---

### POST /settings/avatar
Upload profile image (multipart/form-data).

**Request:** `Content-Type: multipart/form-data`  
**Field:** `avatar` (file)  
**Allowed:** JPEG, PNG, GIF, WebP. Max 5MB.

**Example (curl):**
```bash
curl -X POST http://localhost:3001/settings/avatar \
  -H "Authorization: Bearer YOUR_JWT" \
  -F "avatar=@/path/to/image.jpg"
```

**Response (200):**
```json
{
  "message": "Profile image updated successfully",
  "avatarUrl": "/uploads/avatars/userId-timestamp.jpg"
}
```

---

### DELETE /settings/account
Delete account (soft delete). Requires password and typing "DELETE".

**Request:**
```json
{
  "password": "currentPassword123",
  "confirmation": "DELETE"
}
```

**Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

---

## Error Responses

| Status | Example |
|--------|---------|
| 400 | `{ "message": "Current password is incorrect" }` |
| 401 | `{ "message": "Unauthorized" }` |
| 404 | `{ "message": "User not found" }` |
| 409 | `{ "message": "This email is already in use" }` |

---

## If Settings Button Isn't Triggering API

1. **Check token:** Ensure `localStorage.getItem("token")` exists and is valid.
2. **Check network:** Open DevTools → Network. Verify requests are sent and inspect response.
3. **Check route:** Settings page must be under a route that loads (e.g. `/settings`).
4. **Check CORS:** Backend must allow your frontend origin.
5. **Check guard:** All settings routes use `JwtAuthGuard`; expired tokens return 401.
6. **Check API base:** `NEXT_PUBLIC_API_URL` must point to your backend (e.g. `http://localhost:3001`).
