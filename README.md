# API Documentation: Social Media App

## Base URL

```
http://localhost:3001/api
```

---


---

## 🔧 Environment Setup (.env)

Before running the application, you must configure your environment variables. Create a `.env` file in your project root directory with the following variables:

```env
PORT=3001
SECRET_KEY=your_jwt_secret_key_here
MONGO_URI=mongodb://127.0.0.1:27017/socialMediaClone
```

- `PORT`: The port number your Node.js server will listen on. `ex., 5000`
- `SECRET_KEY`: Secret key used for signing JWT tokens for user authentication.
- `MONGO_URI`: for connecting MongoDB database  `ex., mongodb://127.0.0.1:27017/socialMediaClone`



> **Security Note:**  
> Never commit your `.env` file to any public repository. Add `.env` to your `.gitignore` file to keep sensitive data secure.


---

## Authentication Required

All `/api/user/*` endpoints require a valid JWT passed in the headers as:

```
Authorization: Bearer <token>
```

---

## Notes

* Upload routes require form-data.
* Profile picture and posts URLs are served through `/profile-picture/<filename>` and `/posts/<filename>`.
* Always remove `#` from hashtags before sending requests.

---


---

## Authentication Endpoints (`/api/auth`)

### 1. Signup

**POST** `/auth/signup`

#### Request Body

```json
{
  "username": "string",
  "name": "string",
  "email": "string",
  "password": "string"
}
```

#### Response

```json
{
  "statusCode": 200,
  "message": "Login Successful",
  "token": "string",
  "data": {
    "userId": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  }
}
```


#### Request Body : Example

```json
{
  "username": "dev32732",
  "name": "developer",
  "email": "dev@google.com",
  "password": "defG43%@dnj"
}
```


#### Response : Example

```json
{
    "statusCode": 201,
    "message": "User registered successfully",
    "data": {
        "userId": "684570e63a0278c854ad4441",
        "username": "dev32732",
        "name": "developer",
        "email": "dev@google.com"
    }
}
```


### 2. Login

**POST** `/auth/login`

#### Request Body

```json
{
  "username": "string",
  "password": "string"
}
```

#### Response

Same as Signup.

---

### Request Body : Example
```json
{
    "username": "dev32732",
    "password": "defG43%@dnj"
}
```


## User Endpoints (`/api/user`)

### 3. Update Email

**PATCH** `/user/email`

*example* : `http://localhost:3001/api/user/email`

#### Request Body

```json
{
  "newEmail": "string"
}
```

#### Response

```json
{
  "statusCode": 201,
  "message": "Email Updated Successfully",
  "data": {
    "username": "string",
    "email": "string"
  }
}
```


### Requst Body : Example
```json
{
  "newEmail": "newdev@google.com"
}
```



### 4. Update Name

**PATCH** `/user/name`
*example* : `http://localhost:3001/api/user/name`

#### Request Body

```json
{
  "newName": "string"
}
```

#### Response

```json
{
  "statusCode": 201,
  "message": "name updated successfully",
  "name": "string"
}
```

### Request Body : Example

```json
{
  "newName": "newdevname"
}
```


### 5. Update Username

**PATCH** `/user/username`
*example* : `http://localhost:3001/api/user/username`

#### Request Body

```json
{
  "newUsername": "string"
}
```

#### Response

```json
{
  "statusCode": 201,
  "message": "name updated successfully",
  "username": "string"
}
```

### Request Body : Example

```json
{
  "newUsername": "newdevUsername"
}
```



### 6. Update Profile Picture

**PATCH** `/user/profile-picture`
*example* : `http://localhost:3001/api/user/profile-picture`

* Form-data: Key = `profile-picture`, Value = image file

#### Response

```json
{
  "statusCode": 200,
  "message": "Profile Picture Updated Successfully"
}
```

### 7. Change Account Type

**PATCH** `/user/account-type/:type`
*example* : `http://localhost:3001/api/user/account-type/private`

* `type`: `private` or `public`

#### Response

```json
{
  "statusCode": 201,
  "message": "account type updated successfully (changed to <type>)"
}
```

### 8. Create a Post

**POST** `/user/post`
*example* : `http://localhost:3001/api/user/post`

* Form-data: Key = `post-media`, Value = up to 5 image/video files
* Additional field: `caption`

#### Response

```json
{
  "statusCode": 201,
  "message": "Post created successfully"
}
```

### 9. View Profile

**GET** `/user/view-profile/:username`
*example* : `http://localhost:3001/api/user/view-profile/newdev327322`

#### Response

```json
{
  "statusCode": 200,
  "message": "successfully fetched user profile",
  "data": { /* complete user profile */ }
}
```

### 10. Search Users

**GET** `/user/search/:query`
*example* : `http://localhost:3001/api/user/search/newdev327322`

#### Response

```json
{
  "statusCode": 200,
  "message": "found users",
  "users": [
    {
      "username": "string",
      "name": "string",
      "bio": "string",
      "profilePicture": "full-url"
    }
  ]
}
```

### 11. Search by Hashtag

**GET** `/user/search-hashtag/:hashtag`
*example* : `http://localhost:3001/api/user/search-hashtag/goku` to search `#goku`

* Example: `/search-hashtag/goku` to search `#goku`

#### Response

```json
{
  "statusCode": 200,
  "message": "relevant posts found with this given hashtag: <hashtag>",
  "data": [ /* array of posts */ ]
}
```

### 12. Bookmark a Post

**PATCH** `/user/bookmark`
*example* : `http://localhost:3001/api/user/bookmark`

#### Request Body

```json
{
  "_id": "postId"
}
```

#### Response

```json
{
  "statusCode": 201,
  "message": "post saved successfully !"
}
```

### 13. Like/Unlike Post

**PATCH** `/user/like/:postId`
*example* : `http://localhost:3001/api/user/like/<get-post-id-from-view-profile-endpoint>`

#### Response

```json
{
  "statusCode": 200,
  "message": "Post liked" | "Post unliked",
  "likesCount": number
}
```

### 14. Comment on a Post

**POST** `/user/comment/:postId`
*example* : `http://localhost:3001/api/user/comment/<get-post-id-from-view-profile-endpoint>`

#### Request Body

```json
{
  "comment": "string"
}
```

#### Response

```json
{
  "statusCode": 201,
  "message": "Comment added",
  "comment": { /* comment object */ }
}
```

### 15. Reply to a Comment

**POST** `/user/comment/reply/:commentId`
*example* : `http://localhost:3001/api/user/comment/reply/<get-comment-id-from-comment-on-post-endpoint>`

#### Request Body

```json
{
  "reply": "string"
}
```

#### Response

```json
{
  "statusCode": 200,
  "message": "Reply added",
  "replies": [ /* reply objects */ ]
}
```

### 16. Follow / Unfollow User

**PATCH** `/user/follow/:userId`
*example* : `http://localhost:3001/api/user/follow/<get-user-id-from-search-user-endpoint>`

#### Response

```json
{
  "statusCode": 200,
  "message": "Followed successfully" | "Unfollowed successfully"
}
```

### 17. Get Followers and Following List

**POST** `/user/followers-following`
*example* : `http://localhost:3001/api/user/followers-following`

#### Request Body

```json
{
  "targetUserId": "string"
}
```

#### Response

```json
{
  "statusCode": 200,
  "message": "Successfully got the followers and following lists",
  "followers": [ /* formatted follower list */ ],
  "following": [ /* formatted following list */ ]
}
```

---


