use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Offer {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub title: String, // e.g., "Black Friday Deal"
    pub description: String,
    pub discount_percentage: f64, // e.g., 0.20 for 20% off
    pub active: bool,
    pub code: String, // e.g., "BLACKFRIDAY"
}
