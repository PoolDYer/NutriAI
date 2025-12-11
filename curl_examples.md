# NutriAI API Usage Examples (cURL)

Below are example `curl` commands to interact with the API.

## 1. Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

## 2. Login to get Access Token
```bash
# Returns { "accessToken": "...", "refreshToken": "...", "user": {...} }
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

## 3. Create a Conversation
*Replace `<ACCESS_TOKEN>` with the token received from login.*
```bash
curl -X POST http://localhost:3000/conversations \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "USER_ID_UUID_HERE"
  }'
```

## 4. Send a Message to the Conversation
*Replace `<CONVERSATION_ID>` and `<ACCESS_TOKEN>`.*
```bash
curl -X POST http://localhost:3000/conversations/<CONVERSATION_ID>/messages \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, I need help with my diet plan."
  }'
```

## 5. Get Messages from Conversation
```bash
curl -X GET http://localhost:3000/conversations/<CONVERSATION_ID>/messages \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## 6. Refresh Token
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```
