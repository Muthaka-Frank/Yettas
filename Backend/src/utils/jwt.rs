// src/utils/jwt.rs
use jsonwebtoken::{encode, Header, Algorithm, EncodingKey};
use chrono::{Utc, Duration};
use serde::{Serialize, Deserialize};
use std::env;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // Subject (user email)
    pub exp: i64,    // Expiration time
    pub name: String,
}

// Get the JWT secret from .env
fn get_jwt_secret() -> String {
    env::var("JWT_SECRET").expect("JWT_SECRET must be set in .env file")
}

// Create a new JWT
pub fn create_token(email: &str, name: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::days(7)) // Token is valid for 7 days
        .expect("Failed to create expiration")
        .timestamp();

    let claims = Claims {
        sub: email.to_owned(),
        exp: expiration,
        name: name.to_owned(),
    };

    let header = Header::new(Algorithm::HS256);
    let key = EncodingKey::from_secret(get_jwt_secret().as_ref());
    
    encode(&header, &claims, &key)
}

// Decode a JWT
pub fn decode_token(token: &str) -> Result<jsonwebtoken::TokenData<Claims>, jsonwebtoken::errors::Error> {
    let key = jsonwebtoken::DecodingKey::from_secret(get_jwt_secret().as_ref());
    let validation = jsonwebtoken::Validation::new(Algorithm::HS256);
    
    jsonwebtoken::decode::<Claims>(token, &key, &validation)
}