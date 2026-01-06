use mongodb::{Client, bson::doc};
use crate::models::user::User;
use crate::utils::password;

pub async fn seed_admin(client: &Client) {
    let collection = client.database("yetta_db").collection::<User>("users");

    // Check if admin exists
    match collection.find_one(doc! { "email": "admin@yetta.com" }, None).await {
        Ok(None) => {
             // Create admin
            let password_hash = password::hash_password("admin123").unwrap_or_else(|_| "hash_failed".to_string());
            
            let new_admin = User {
                id: None,
                name: "Admin User".to_string(),
                email: "admin@yetta.com".to_string(),
                password_hash: Some(password_hash),
                google_id: None,
                reset_token: None,
                reset_token_expiry: None,
                role: "admin".to_string(), 
            };

            if let Err(e) = collection.insert_one(new_admin, None).await {
                log::error!("Failed to seed admin user: {}", e);
            } else {
                log::info!("✅ Admin user seeded: admin@yetta.com / admin123");
            }
        },
        Ok(Some(_)) => {
            log::info!("ℹ️ Admin user already exists");
        },
        Err(e) => {
            log::error!("Error checking for admin user: {}", e);
        }
    }
}
