use mongodb::{Client, options::ClientOptions, bson::doc};
use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;
use chrono::{DateTime, Utc};
use std::env;
use dotenv::dotenv;

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderItem {
    pub item_id: String,
    pub title: String,
    pub quantity: u32,
    pub price: f64,
    pub image_src: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Order {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_email: String,
    pub items: Vec<OrderItem>,
    pub total: f64,
    pub status: String,
    pub payment_method: String,
    pub created_at: DateTime<Utc>,
}

#[actix_web::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    
    let mongo_uri = env::var("MONGODB_URI").expect("MONGODB_URI not set");
    let client_options = ClientOptions::parse(&mongo_uri).await?;
    let client = Client::with_options(client_options)?;
    
    println!("Connected to MongoDB");
    
    let db = client.database("yetta_db");
    let collection = db.collection::<Order>("orders");
    
    let new_order = Order {
        id: None,
        user_email: "test@example.com".to_string(),
        items: vec![
            OrderItem {
                item_id: "test_item_id".to_string(),
                title: "Test Item".to_string(),
                quantity: 1,
                price: 100.0,
                image_src: "img.jpg".to_string(),
            }
        ],
        total: 100.0,
        status: "Pending".to_string(),
        payment_method: "mpesa".to_string(),
        created_at: Utc::now(),
    };
    
    println!("Attempting to insert order...");
    match collection.insert_one(new_order, None).await {
        Ok(res) => println!("Successfully inserted order: {:?}", res.inserted_id),
        Err(e) => println!("Failed to insert order: {:#?}", e),
    }
    
    Ok(())
}
