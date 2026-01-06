use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MenuItem {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub title: String,
    pub description: String,
    pub price: f64,
    pub image_src: String,
    pub category: String, // "cakes", "cookies", "drinks", "icecream"
    #[serde(default)]
    pub available: bool,
    #[serde(default)]
    pub options: Vec<String>, // e.g., ["Chocolate", "Vanilla"] for generic items
}
