use actix_web::{web, HttpResponse, Responder};
use mongodb::{Client, Collection, bson::{doc, oid::ObjectId}};
use serde::{Deserialize, Serialize};
use log;
use reqwest; // Added for Google token verification

use crate::models::user::{User, PublicUser};
use crate::utils::{password, jwt};

// --- Helper Structs for Requests/Responses ---

#[derive(Deserialize)]
pub struct SignupRequest {
    name: String,
    email: String,
    password: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Deserialize)]
pub struct GoogleRequest {
    credential: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    token: String,
    user: PublicUser,
}

#[derive(Serialize)]
struct ErrorResponse {
    message: String,
}

// Helper to get the user collection from the DB
fn get_user_collection(client: &web::Data<Client>) -> Collection<User> {
    client.database("yetta_db").collection("users")
}

// --- Route Handlers ---

/// POST /api/auth/signup
pub async fn signup(client: web::Data<Client>, req: web::Json<SignupRequest>) -> impl Responder {
    let users_collection = get_user_collection(&client);
    
    // 1. Check if user already exists
    match users_collection.find_one(doc! { "email": &req.email }, None).await {
        Ok(Some(_)) => {
            return HttpResponse::Conflict().json(ErrorResponse { 
                message: "Email already exists".to_string() 
            });
        },
        Ok(None) => (), // Email is available
        Err(e) => {
            log::error!("Database error during signup lookup: {}", e);
            return HttpResponse::InternalServerError().json(ErrorResponse { message: "Database error".to_string() });
        }
    }
    
    // 2. Hash the password
    let password_hash = match password::hash_password(&req.password) {
        Ok(hash) => hash,
        Err(e) => {
            log::error!("Password hashing error: {}", e);
            return HttpResponse::InternalServerError().json(ErrorResponse { message: "Failed to create account".to_string() });
        }
    };
    
    // 3. Create new user
    let new_user = User {
        id: Some(ObjectId::new()),
        name: req.name.clone(),
        email: req.email.clone(),
        password_hash: Some(password_hash),
        google_id: None,
        reset_token: None,
        reset_token_expiry: None,
    };
    
    // 4. Insert into database
    // We clone new_user before insert because insert_one consumes the value,
    // and we need the original for token generation.
    if let Err(e) = users_collection.insert_one(&new_user, None).await {
        log::error!("Database insert error: {}", e);
        return HttpResponse::InternalServerError().json(ErrorResponse { message: "Failed to save user".to_string() });
    }
    
    // 5. Create JWT using the new utility function
    let token = match jwt::create_token(&new_user.email, &new_user.name) {
        Ok(token) => token,
        Err(e) => {
            log::error!("JWT creation error: {}", e);
            return HttpResponse::InternalServerError().json(ErrorResponse { message: "Failed to create session".to_string() });
        }
    };
    
    // 6. Send response
    HttpResponse::Ok().json(AuthResponse {
        token,
        user: new_user.into(),
    })
}

// Helper Struct for Google Token Info
#[derive(Deserialize)]
struct GoogleTokenInfo {
    email: String,
    name: Option<String>,
    sub: String, // This is the unique Google ID
}

/// POST /api/auth/login
pub async fn login(client: web::Data<Client>, req: web::Json<LoginRequest>) -> impl Responder {
    let users_collection = get_user_collection(&client);

    log::info!("Attempting login for email: {}", req.email);

    // 1. Find user by email
    let user = match users_collection.find_one(doc! { "email": &req.email }, None).await {
        Ok(Some(user)) => {
            log::info!("User found: {}", user.email);
            user
        },
        Ok(None) => {
            log::warn!("Login failed: User not found for email: {}", req.email);
            // Do not reveal if email exists or not for security
            return HttpResponse::Unauthorized().json(ErrorResponse { message: "Invalid email or password".to_string() });
        },
        Err(e) => {
            log::error!("Database error during login lookup: {}", e);
            return HttpResponse::InternalServerError().json(ErrorResponse { message: "Database error".to_string() });
        }
    };

    // 2. Check if user has a password (they might be a Google user)
    let hash = match user.password_hash.as_ref() {
        Some(hash) => hash,
        None => {
            log::warn!("Login failed: User {} has no password (likely Google auth)", req.email);
            // Logged in with email but has no password hash set
            return HttpResponse::Unauthorized().json(ErrorResponse { message: "Please log in with Google, or reset your password.".to_string() });
        }
    };
    
    // 3. Verify password
    match password::verify_password(hash, &req.password) {
        Ok(true) => {
            log::info!("Password verified for user: {}", req.email);
            // 4. Create JWT
            let token = match jwt::create_token(&user.email, &user.name) {
                Ok(token) => token,
                Err(e) => {
                    log::error!("JWT creation error: {}", e);
                    return HttpResponse::InternalServerError().json(ErrorResponse { message: "Failed to create session".to_string() });
                }
            };
            
            // 5. Send response
            HttpResponse::Ok().json(AuthResponse {
                token,
                user: user.into(),
            })
        },
        _ => {
            log::warn!("Login failed: Invalid password for user: {}", req.email);
            // Wrong password
            HttpResponse::Unauthorized().json(ErrorResponse { message: "Invalid email or password".to_string() })
        }
    }
}

/// POST /api/auth/google
pub async fn verify_google_token(client: web::Data<Client>, req: web::Json<GoogleRequest>) -> impl Responder {
    log::info!("Verifying Google token...");

    // 1. Verify token with Google API
    let client_http = reqwest::Client::new();
    let response = match client_http.get("https://oauth2.googleapis.com/tokeninfo")
        .query(&[("id_token", &req.credential)])
        .send()
        .await {
            Ok(res) => res,
            Err(e) => {
                log::error!("Failed to contact Google API: {}", e);
                return HttpResponse::InternalServerError().json(ErrorResponse { message: "Failed to verify with Google".to_string() });
            }
        };

    if !response.status().is_success() {
        log::warn!("Google API returned error status: {}", response.status());
        return HttpResponse::Unauthorized().json(ErrorResponse { message: "Invalid Google token".to_string() });
    }

    let google_info: GoogleTokenInfo = match response.json().await {
        Ok(info) => info,
        Err(e) => {
            log::error!("Failed to parse Google response: {}", e);
            return HttpResponse::InternalServerError().json(ErrorResponse { message: "Invalid response from Google".to_string() });
        }
    };

    log::info!("Google token verified for: {}", google_info.email);

    let users_collection = get_user_collection(&client);
    
    // 2. Find or create user in database using Google ID
    let user = match users_collection.find_one(doc! { "google_id": &google_info.sub }, None).await {
        Ok(Some(user)) => {
            log::info!("Existing Google user found: {}", user.email);
            user
        }, 
        Ok(None) => {
            // Check if email exists (account linking)
            // Ideally, you'd want to be careful here. If someone registers with email, then logs in with Google, 
            // should we link them? For simplicity, let's check email.
            if let Ok(Some(mut existing_user)) = users_collection.find_one(doc! { "email": &google_info.email }, None).await {
                 log::info!("Linking Google account to existing email: {}", google_info.email);
                 // Update user with Google ID
                 existing_user.google_id = Some(google_info.sub.clone());
                 let _ = users_collection.update_one(
                     doc! { "email": &google_info.email },
                     doc! { "$set": { "google_id": &google_info.sub } },
                     None
                 ).await;
                 existing_user
            } else {
                // User does not exist, create them
                log::info!("Creating new Google user: {}", google_info.email);
                let new_user = User {
                    id: Some(ObjectId::new()),
                    name: google_info.name.unwrap_or_else(|| "Google User".to_string()),
                    email: google_info.email.clone(),
                    password_hash: None, // No password for Google users
                    google_id: Some(google_info.sub),
                    reset_token: None,
                    reset_token_expiry: None,
                };
                
                if let Err(e) = users_collection.insert_one(&new_user, None).await {
                    log::error!("Database insert error for Google user: {}", e);
                    return HttpResponse::InternalServerError().json(ErrorResponse { message: "Failed to save Google user".to_string() });
                }
                new_user
            }
        },
        Err(e) => {
            log::error!("Database error during Google login: {}", e);
            return HttpResponse::InternalServerError().json(ErrorResponse { message: "Database error".to_string() });
        }
    };
    
    // 3. Create your app's JWT
    let token = match jwt::create_token(&user.email, &user.name) {
        Ok(token) => token,
        Err(e) => {
            log::error!("JWT creation error: {}", e);
            return HttpResponse::InternalServerError().json(ErrorResponse { message: "Failed to create session".to_string() });
        }
    };
    
    // 4. Send response
    HttpResponse::Ok().json(AuthResponse {
        token,
        user: user.into(),
    })
}