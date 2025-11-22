use serde::{Serialize, Deserialize};
use mongodb::bson::oid::ObjectId;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>, // MongoDB's unique ID
    pub name: String,
    pub email: String,
    
    // #[serde(skip_serializing)] // REMOVED: This prevented saving to DB!
    pub password_hash: Option<String>, // Optional because Google users won't have one
    
    #[serde(skip_serializing_if = "Option::is_none")]
    pub google_id: Option<String>, // For Google-authenticated users

    #[serde(skip_serializing_if = "Option::is_none")]
    pub reset_token: Option<String>, // For password reset
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reset_token_expiry: Option<i64>, // Timestamp for token expiry
}

// Model for sending user data back to the client (without sensitive info)
#[derive(Serialize, Deserialize, Debug)]
pub struct PublicUser {
    pub id: String, // CRITICAL FIX: The client needs the string ID
    pub name: String,
    pub email: String,
}

// Conversion trait to hide sensitive fields and convert ObjectId to String
impl From<User> for PublicUser {
    fn from(user: User) -> Self {
        PublicUser {
            // CRITICAL FIX: Convert the ObjectId to a hex string for the client
            id: user.id.map(|id| id.to_hex()).unwrap_or_default(), 
            name: user.name,
            email: user.email,
        }
    }
}