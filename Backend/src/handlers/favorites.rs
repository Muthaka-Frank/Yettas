use actix_web::{web, HttpResponse, Responder, HttpRequest};
use mongodb::{Client, Collection, bson::doc};
use serde::{Deserialize, Serialize};
use serde_json::json;
use futures::stream::StreamExt;

use crate::models::favorite::Favorite;
use crate::utils::jwt::decode_token;

#[derive(Deserialize)]
pub struct AddFavoriteRequest {
    pub item_id: String,
    pub item_title: String,
    pub item_image: String,
    pub item_price: f64,
}

#[derive(Serialize)]
struct ErrorResponse {
    message: String,
}

// Helper to get the favorites collection
fn get_favorite_collection(client: &web::Data<Client>) -> Collection<Favorite> {
    client.database("yetta_db").collection("favorites")
}

// Helper to extract user email from JWT
fn get_user_email_from_req(req: &HttpRequest) -> Result<String, String> {
    if let Some(auth_header) = req.headers().get("Authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                match decode_token(token) {
                    Ok(token_data) => return Ok(token_data.claims.sub),
                    Err(_) => return Err("Invalid token".to_string()),
                }
            }
        }
    }
    Err("No authorization header".to_string())
}

/// POST /api/favorites/add
pub async fn add_favorite(
    client: web::Data<Client>, 
    req: web::Json<AddFavoriteRequest>,
    http_req: HttpRequest
) -> impl Responder {
    let user_email = match get_user_email_from_req(&http_req) {
        Ok(email) => email,
        Err(e) => return HttpResponse::Unauthorized().json(ErrorResponse { message: e }),
    };

    let collection = get_favorite_collection(&client);

    // Check if already exists
    let filter = doc! { "user_email": &user_email, "item_id": &req.item_id };
    if let Ok(Some(_)) = collection.find_one(filter, None).await {
        return HttpResponse::Conflict().json(json!({ "message": "Item already in favorites" }));
    }

    let new_favorite = Favorite {
        id: None,
        user_email,
        item_id: req.item_id.clone(),
        item_title: req.item_title.clone(),
        item_image: req.item_image.clone(),
        item_price: req.item_price,
    };

    match collection.insert_one(new_favorite, None).await {
        Ok(_) => HttpResponse::Ok().json(json!({ "message": "Added to favorites" })),
        Err(e) => HttpResponse::InternalServerError().json(ErrorResponse { message: format!("Failed to add favorite: {}", e) }),
    }
}

/// DELETE /api/favorites/{item_id}
pub async fn remove_favorite(
    client: web::Data<Client>,
    path: web::Path<String>,
    http_req: HttpRequest
) -> impl Responder {
    let item_id = path.into_inner();
    let user_email = match get_user_email_from_req(&http_req) {
        Ok(email) => email,
        Err(e) => return HttpResponse::Unauthorized().json(ErrorResponse { message: e }),
    };

    let collection = get_favorite_collection(&client);
    let filter = doc! { "user_email": user_email, "item_id": item_id };

    match collection.delete_one(filter, None).await {
        Ok(result) => {
            if result.deleted_count == 1 {
                HttpResponse::Ok().json(json!({ "message": "Removed from favorites" }))
            } else {
                HttpResponse::NotFound().json(json!({ "message": "Favorite not found" }))
            }
        },
        Err(e) => HttpResponse::InternalServerError().json(ErrorResponse { message: format!("Failed to remove favorite: {}", e) }),
    }
}

/// GET /api/favorites
pub async fn get_favorites(
    client: web::Data<Client>,
    http_req: HttpRequest
) -> impl Responder {
    let user_email = match get_user_email_from_req(&http_req) {
        Ok(email) => email,
        Err(e) => return HttpResponse::Unauthorized().json(ErrorResponse { message: e }),
    };

    let collection = get_favorite_collection(&client);
    let filter = doc! { "user_email": user_email };

    let mut cursor = match collection.find(filter, None).await {
        Ok(cursor) => cursor,
        Err(e) => return HttpResponse::InternalServerError().json(ErrorResponse { message: format!("Database error: {}", e) }),
    };

    let mut favorites = Vec::new();
    while let Some(result) = cursor.next().await {
        match result {
            Ok(fav) => favorites.push(fav),
            Err(e) => log::error!("Error deserializing favorite: {}", e),
        }
    }

    HttpResponse::Ok().json(favorites)
}
