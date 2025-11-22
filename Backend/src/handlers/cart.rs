use actix_web::{web, HttpResponse, Responder, HttpRequest};
use mongodb::{Client, Collection, bson::doc};
use serde::{Deserialize, Serialize};
use serde_json::json;
use chrono::Utc;
use futures::stream::StreamExt;

use crate::models::user::User;
use crate::models::order::{Order, OrderItem};
use crate::utils::jwt::decode_token;
use crate::handlers::mpesa::send_stk_push;

// Struct for the item coming from React
#[derive(Deserialize, Debug)]
pub struct CartItemRequest {
    item_id: String,
    //quantity: u32,
}

// Struct for the checkout request from React
#[derive(Deserialize, Debug)]
pub struct CheckoutRequest {
    payment_method: String, // "mpesa" or "bank"
    phone_number: Option<String>,
    bank_account: Option<String>,
    items: Vec<OrderItem>, // Frontend sends the items to be ordered
    total: f64,
}

#[derive(Serialize)]
struct ErrorResponse {
    message: String,
}

// Helper to get the user collection
#[allow(dead_code)]
fn get_user_collection(client: &web::Data<Client>) -> Collection<User> {
    client.database("yetta_db").collection("users")
}

// Helper to get the order collection
fn get_order_collection(client: &web::Data<Client>) -> Collection<Order> {
    client.database("yetta_db").collection("orders")
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

/// POST /api/cart/add
/// Adds an item to a user's cart (Mock version)
pub async fn add_to_cart(_client: web::Data<Client>, item: web::Json<CartItemRequest>) -> impl Responder {
    // In a real app, you would get the user's ID from their JWT token.
    // For this example, we'll just log it.
    log::info!("Adding item {} to cart", item.item_id);
    
    HttpResponse::Ok().json(json!({ "message": "Item added to cart" })) 
}

/// POST /api/cart/checkout
/// Processes the checkout and saves the order
pub async fn process_checkout(
    client: web::Data<Client>, 
    req: web::Json<CheckoutRequest>,
    http_req: HttpRequest
) -> impl Responder {
    
    // 1. Authenticate User
    let user_email = match get_user_email_from_req(&http_req) {
        Ok(email) => email,
        Err(e) => return HttpResponse::Unauthorized().json(ErrorResponse { message: e }),
    };
    
    log::info!("Processing checkout for user {} with method {}", user_email, req.payment_method);

    // 2. Process Payment
    let status = if req.payment_method == "mpesa" {
        if let Some(phone) = &req.phone_number {
            if phone.len() < 8 { 
                 return HttpResponse::BadRequest().json(ErrorResponse { message: "Invalid Mpesa Express phone number format".to_string() });
            }
            log::info!("Initiating Mpesa Express STK Push to {}", phone);
            
            // Call actual Mpesa API
            match send_stk_push(phone, req.total as u32).await {
                Ok(res) => {
                    log::info!("STK Push success: {:?}", res.message);
                    "Payment Initiated"
                },
                Err(e) => {
                    log::error!("STK Push failed: {}", e);
                    return HttpResponse::BadRequest().json(ErrorResponse { message: format!("Payment failed: {}", e) });
                }
            }
        } else {
            return HttpResponse::BadRequest().json(ErrorResponse { message: "Mpesa Express phone number required".to_string() });
        }
    } else if req.payment_method == "bank" {
        if let Some(account) = &req.bank_account {
            log::info!("Processing bank transfer for account {}", account);
            "Paid"
        } else {
            return HttpResponse::BadRequest().json(ErrorResponse { message: "Bank account required".to_string() });
        }
    } else {
        return HttpResponse::BadRequest().json(ErrorResponse { message: "Invalid payment method specified".to_string() });
    };

    // 3. Create Order Record
    let new_order = Order {
        id: None, // MongoDB will generate this
        user_email: user_email.clone(),
        items: req.items.iter().map(|i| OrderItem {
            item_id: i.item_id.clone(),
            title: i.title.clone(),
            quantity: i.quantity,
            price: i.price,
            image_src: i.image_src.clone(),
        }).collect(),
        total: req.total,
        status: status.to_string(),
        payment_method: req.payment_method.clone(),
        created_at: Utc::now(),
    };

    let collection = get_order_collection(&client);
    match collection.insert_one(new_order, None).await {
        Ok(_) => HttpResponse::Ok().json(json!({ "message": "Checkout successful!", "status": status })),
        Err(e) => {
            log::error!("Failed to save order: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse { message: "Failed to save order".to_string() })
        }
    }
}

/// GET /api/orders
/// Fetches orders for the logged-in user
pub async fn get_user_orders(
    client: web::Data<Client>,
    http_req: HttpRequest
) -> impl Responder {
    // 1. Authenticate User
    let user_email = match get_user_email_from_req(&http_req) {
        Ok(email) => email,
        Err(e) => return HttpResponse::Unauthorized().json(ErrorResponse { message: e }),
    };

    let collection = get_order_collection(&client);
    let filter = doc! { "user_email": user_email };
    
    // Find orders
    let mut cursor = match collection.find(filter, None).await {
        Ok(cursor) => cursor,
        Err(e) => return HttpResponse::InternalServerError().json(ErrorResponse { message: format!("Database error: {}", e) }),
    };

    // Collect into vector
    let mut orders = Vec::new();
    while let Some(result) = cursor.next().await {
        match result {
            Ok(order) => orders.push(order),
            Err(e) => log::error!("Error deserializing order: {}", e),
        }
    }

    HttpResponse::Ok().json(orders)
}