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

#[derive(Debug, Serialize, Deserialize)]
pub struct PublicOrder {
    pub id: String,
    pub user_email: String,
    pub items: Vec<OrderItem>,
    pub total: f64,
    pub status: String,
    pub payment_method: String,
    pub created_at: DateTime<Utc>,
}

impl From<Order> for PublicOrder {
    fn from(order: Order) -> Self {
        PublicOrder {
            id: order.id.map(|id| id.to_hex()).unwrap_or_default(),
            user_email: order.user_email,
            items: order.items,
            total: order.total,
            status: order.status,
            payment_method: order.payment_method,
            created_at: order.created_at,
        }
    }
}
