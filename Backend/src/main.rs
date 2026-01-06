// src/main.rs
use actix_cors::Cors;
use actix_web::{web, App, HttpServer, middleware::Logger};
use std::env;
use dotenv::dotenv;

// Import route handlers
use crate::handlers::auth::{login, signup, verify_google_token};
use crate::handlers::cart::{add_to_cart, process_checkout, get_user_orders};
use crate::handlers::mpesa::initiate_stk_push;
use crate::handlers::favorites::{add_favorite, remove_favorite, get_favorites};
use crate::handlers::password_reset::{forgot_password, reset_password};
use crate::handlers::menu::{get_menu, add_menu_item, update_menu_item, delete_menu_item};
use crate::handlers::admin::{get_all_orders, update_order_status};
use crate::handlers::offer::{get_offers, get_all_offers, add_offer, toggle_offer};

// Import modules
mod db;
mod handlers;
mod models;
mod utils;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables from .env file
    dotenv().ok();
    
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // Get server address from .env
    let server_addr = env::var("SERVER_ADDR").unwrap_or_else(|_| "127.0.0.1:8080".to_string());

    // Connect to MongoDB
    let mongo_client = db::init_db().await.expect("Failed to connect to MongoDB.");
    log::info!("Successfully connected to MongoDB");

    // Seed Admin User
    utils::seed::seed_admin(&mongo_client).await;
    // Seed Menu Items
    utils::seed_menu::seed_menu(&mongo_client).await;



    log::info!("Starting server at http://{}", server_addr);

    HttpServer::new(move || {
        // Configure CORS to allow requests from your React app
        let cors = Cors::default()
            .allowed_origin("http://localhost:5173") // Your React app's address
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"]) // Added PUT, DELETE
            .allowed_headers(vec!["Content-Type", "Authorization"])
            .max_age(3600);

        App::new()
            // 1. Pass the MongoDB client to all handlers
            .app_data(web::Data::new(mongo_client.clone()))
            // 2. Enable CORS
            .wrap(cors)
            // 3. Enable Logger
            .wrap(Logger::default())
            // 4. Define API routes
            .service(
                web::scope("/api/auth") // Base path for auth
                    .route("/signup", web::post().to(signup))
                    .route("/login", web::post().to(login))
                    .route("/google", web::post().to(verify_google_token))
                    .route("/forgot-password", web::post().to(forgot_password))
                    .route("/reset-password", web::post().to(reset_password))
            )
            .service(
                web::scope("/api/cart")
                    .route("/add", web::post().to(add_to_cart))
                    .route("/checkout", web::post().to(process_checkout))
            )
            .service(
                web::scope("/api/orders")
                    .route("", web::get().to(get_user_orders))
            )
            .service(
                web::scope("/api/payment")
                    .route("/mpesa/stkpush", web::post().to(initiate_stk_push))
            )
            .service(
                web::scope("/api/menu")
                    .route("", web::get().to(get_menu))
            )
            .service(
                web::scope("/api/offers")
                    .route("", web::get().to(get_offers))
            )
            // Admin Routes
            .service(
                web::scope("/api/admin")
                    .service(
                        web::scope("/menu")
                            .route("", web::post().to(add_menu_item))
                            .route("/{id}", web::put().to(update_menu_item))
                            .route("/{id}", web::delete().to(delete_menu_item))
                    )
                    .service(
                        web::scope("/orders")
                            .route("", web::get().to(get_all_orders))
                            .route("/{id}/status", web::put().to(update_order_status))
                    )
                    .service(
                        web::scope("/offers")
                            .route("", web::get().to(get_all_offers))
                            .route("", web::post().to(add_offer))
                            .route("/{id}/toggle", web::put().to(toggle_offer))
                    )
            )
            .service(
                web::scope("/api/favorites")
                    .route("", web::get().to(get_favorites))
                    .route("/add", web::post().to(add_favorite))
                    .route("/{item_id}", web::delete().to(remove_favorite))
            )
    })
    .bind(&server_addr)?
    .run()
    .await
}