use actix_web::{web, HttpResponse, Responder};
use mongodb::{Client, Collection, bson::doc};
use serde::{Deserialize, Serialize};
use log;
use uuid::Uuid;
use chrono::{Utc, Duration};

use crate::models::user::User;
use crate::utils::password;

#[derive(Deserialize)]
pub struct ForgotPasswordRequest {
    email: String,
}

#[derive(Deserialize)]
pub struct ResetPasswordRequest {
    token: String,
    new_password: String,
}

#[derive(Serialize)]
struct MessageResponse {
    message: String,
}

fn get_user_collection(client: &web::Data<Client>) -> Collection<User> {
    client.database("yetta_db").collection("users")
}

/// POST /api/auth/forgot-password
pub async fn forgot_password(client: web::Data<Client>, req: web::Json<ForgotPasswordRequest>) -> impl Responder {
    let users_collection = get_user_collection(&client);
    
    // 1. Check if user exists
    let _user = match users_collection.find_one(doc! { "email": &req.email }, None).await {
        Ok(Some(user)) => user,
        Ok(None) => {
            // For security, don't reveal that the user doesn't exist.
            // Just pretend we sent an email.
            log::info!("Forgot password requested for non-existent email: {}", req.email);
            return HttpResponse::Ok().json(MessageResponse { 
                message: "If an account exists with this email, a reset link has been sent.".to_string() 
            });
        },
        Err(e) => {
            log::error!("Database error: {}", e);
            return HttpResponse::InternalServerError().json(MessageResponse { message: "Database error".to_string() });
        }
    };

    // 2. Generate Reset Token
    let reset_token = Uuid::new_v4().to_string();
    let expiry = Utc::now() + Duration::hours(1);
    let expiry_ts = expiry.timestamp_millis();

    // 3. Save token to DB
    let update_result = users_collection.update_one(
        doc! { "email": &req.email },
        doc! { "$set": { 
            "reset_token": &reset_token,
            "reset_token_expiry": expiry_ts
        }},
        None
    ).await;

    if let Err(e) = update_result {
        log::error!("Failed to save reset token: {}", e);
        return HttpResponse::InternalServerError().json(MessageResponse { message: "Failed to process request".to_string() });
    }

    // 4. "Send" Email (Log to console)
    let reset_link = format!("http://localhost:5173/reset-password?token={}", reset_token);
    log::info!("---------------------------------------------------");
    log::info!("PASSWORD RESET LINK FOR {}:", req.email);
    log::info!("{}", reset_link);
    log::info!("---------------------------------------------------");

    HttpResponse::Ok().json(MessageResponse { 
        message: "If an account exists with this email, a reset link has been sent.".to_string() 
    })
}

/// POST /api/auth/reset-password
pub async fn reset_password(client: web::Data<Client>, req: web::Json<ResetPasswordRequest>) -> impl Responder {
    let users_collection = get_user_collection(&client);

    // 1. Find user by token
    let user = match users_collection.find_one(doc! { "reset_token": &req.token }, None).await {
        Ok(Some(user)) => user,
        Ok(None) => {
            return HttpResponse::BadRequest().json(MessageResponse { message: "Invalid or expired token".to_string() });
        },
        Err(e) => {
            log::error!("Database error: {}", e);
            return HttpResponse::InternalServerError().json(MessageResponse { message: "Database error".to_string() });
        }
    };

    // 2. Check Expiry
    let now = Utc::now().timestamp_millis();
    if let Some(expiry) = user.reset_token_expiry {
        if now > expiry {
            return HttpResponse::BadRequest().json(MessageResponse { message: "Token has expired".to_string() });
        }
    } else {
        return HttpResponse::BadRequest().json(MessageResponse { message: "Invalid token state".to_string() });
    }

    // 3. Hash new password
    let password_hash = match password::hash_password(&req.new_password) {
        Ok(hash) => hash,
        Err(e) => {
            log::error!("Password hashing error: {}", e);
            return HttpResponse::InternalServerError().json(MessageResponse { message: "Failed to reset password".to_string() });
        }
    };

    // 4. Update User (Set new password, clear token)
    let update_result = users_collection.update_one(
        doc! { "_id": user.id },
        doc! { 
            "$set": { "password_hash": password_hash },
            "$unset": { "reset_token": "", "reset_token_expiry": "" }
        },
        None
    ).await;

    match update_result {
        Ok(_) => HttpResponse::Ok().json(MessageResponse { message: "Password reset successful. You can now login.".to_string() }),
        Err(e) => {
            log::error!("Failed to update password: {}", e);
            HttpResponse::InternalServerError().json(MessageResponse { message: "Failed to update password".to_string() })
        }
    }
}
