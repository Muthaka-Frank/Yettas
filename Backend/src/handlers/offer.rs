use actix_web::{web, HttpResponse, Responder};
use mongodb::{Client, Collection, bson::{doc, oid::ObjectId}};
use crate::models::offer::Offer;
use futures::stream::TryStreamExt;

fn get_offer_collection(client: &web::Data<Client>) -> Collection<Offer> {
    client.database("yetta_db").collection("offers")
}

// GET /api/offers (Public)
pub async fn get_offers(client: web::Data<Client>) -> impl Responder {
    let collection = get_offer_collection(&client);
    let mut cursor = match collection.find(doc! {"active": true}, None).await {
        Ok(cursor) => cursor,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    let mut offers: Vec<Offer> = Vec::new();
    while let Ok(Some(offer)) = cursor.try_next().await {
        offers.push(offer);
    }

    HttpResponse::Ok().json(offers)
}

// GET /api/admin/offers (Admin - View All)
pub async fn get_all_offers(client: web::Data<Client>) -> impl Responder {
    let collection = get_offer_collection(&client);
    let mut cursor = match collection.find(None, None).await {
        Ok(cursor) => cursor,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    let mut offers: Vec<Offer> = Vec::new();
    while let Ok(Some(offer)) = cursor.try_next().await {
        offers.push(offer);
    }

    HttpResponse::Ok().json(offers)
}

// POST /api/admin/offers (Admin)
pub async fn add_offer(client: web::Data<Client>, offer: web::Json<Offer>) -> impl Responder {
    let collection = get_offer_collection(&client);
    let new_offer = offer.into_inner();
    match collection.insert_one(new_offer, None).await {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

// PUT /api/admin/offers/{id}/toggle (Admin)
pub async fn toggle_offer(client: web::Data<Client>, path: web::Path<String>) -> impl Responder {
    let id = path.into_inner();
    let object_id = match ObjectId::parse_str(&id) {
        Ok(oid) => oid,
        Err(_) => return HttpResponse::BadRequest().body("Invalid ID"),
    };

    let collection = get_offer_collection(&client);
    // Fetch first to toggle
    let offer = match collection.find_one(doc! {"_id": object_id}, None).await {
        Ok(Some(o)) => o,
        _ => return HttpResponse::NotFound().body("Offer not found"),
    };

    let new_prospect = !offer.active;

    match collection.update_one(
        doc! {"_id": object_id},
        doc! {"$set": {"active": new_prospect}},
        None
    ).await {
        Ok(_) => HttpResponse::Ok().json(doc! {"message": "Toggled successfully", "active": new_prospect}),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}
