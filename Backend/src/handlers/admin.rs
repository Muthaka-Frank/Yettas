use actix_web::{web, HttpResponse, Responder};
use mongodb::{Client, Collection, bson::{doc, oid::ObjectId}};
use futures::stream::TryStreamExt;
use crate::models::order::{Order, PublicOrder};
use serde::Deserialize;

fn get_order_collection(client: &web::Data<Client>) -> Collection<Order> {
    client.database("yetta_db").collection("orders")
}

#[derive(Deserialize)]
pub struct StatusUpdate {
    status: String,
}

// GET /api/admin/orders
pub async fn get_all_orders(client: web::Data<Client>) -> impl Responder {
    let collection = get_order_collection(&client);
    // Sort by created_at desc
    let find_options = mongodb::options::FindOptions::builder()
        .sort(doc! { "created_at": -1 })
        .build();

    let mut cursor = match collection.find(None, find_options).await {
        Ok(cursor) => cursor,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    let mut orders: Vec<PublicOrder> = Vec::new();
    while let Ok(Some(order)) = cursor.try_next().await {
        orders.push(order.into());
    }

    HttpResponse::Ok().json(orders)
}

// PUT /api/admin/orders/{id}/status
pub async fn update_order_status(
    client: web::Data<Client>,
    path: web::Path<String>,
    body: web::Json<StatusUpdate>
) -> impl Responder {
    let id = path.into_inner();
    let object_id = match ObjectId::parse_str(&id) {
        Ok(oid) => oid,
        Err(_) => return HttpResponse::BadRequest().body("Invalid ID"),
    };

    let collection = get_order_collection(&client);
    match collection.update_one(
        doc! {"_id": object_id},
        doc! {"$set": {"status": &body.status}},
        None
    ).await {
        Ok(_) => HttpResponse::Ok().json(doc! {"message": "Order status updated"}),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}
