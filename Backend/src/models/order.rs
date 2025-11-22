use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;
use chrono::{DateTime, Utc};

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
    pub user_email: String, // Using email as the link for now since we have it in the token
    pub items: Vec<OrderItem>,
    pub total: f64,
    pub status: String, // "Pending", "Paid", "Delivered"
    pub payment_method: String,
    pub created_at: DateTime<Utc>,
}
