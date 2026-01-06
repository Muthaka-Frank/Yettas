use actix_web::{web, HttpResponse, Responder};
use mongodb::{Client, Collection, bson::{doc, oid::ObjectId}};
use futures::stream::TryStreamExt;
use crate::models::menu::MenuItem;


fn get_menu_collection(client: &web::Data<Client>) -> Collection<MenuItem> {
    client.database("yetta_db").collection("menu_items")
}

// GET /api/menu
pub async fn get_menu(client: web::Data<Client>) -> impl Responder {
    let collection = get_menu_collection(&client);
    let mut cursor = match collection.find(None, None).await {
        Ok(cursor) => cursor,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    let mut menu_items: Vec<MenuItem> = Vec::new();
    while let Ok(Some(item)) = cursor.try_next().await {
        menu_items.push(item);
    }

    HttpResponse::Ok().json(menu_items)
}

// POST /api/admin/menu (Admin only)
pub async fn add_menu_item(client: web::Data<Client>, item: web::Json<MenuItem>) -> impl Responder {
    let collection = get_menu_collection(&client);
    // Ideally check admin role here via middleware or claims extraction
    
    let new_item = item.into_inner();
    match collection.insert_one(new_item, None).await {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

// PUT /api/admin/menu/{id} (Admin only)
pub async fn update_menu_item(
    client: web::Data<Client>,
    path: web::Path<String>,
    item: web::Json<MenuItem>
) -> impl Responder {
    let id = path.into_inner();
    let object_id = match ObjectId::parse_str(&id) {
        Ok(oid) => oid,
        Err(_) => return HttpResponse::BadRequest().body("Invalid ID"),
    };

    let collection = get_menu_collection(&client);
    let update = doc! {
        "$set": {
            "title": &item.title,
            "description": &item.description,
            "price": item.price,
            "image_src": &item.image_src,
            "category": &item.category,
            "available": item.available,
            "options": &item.options,
        }
    };

    match collection.update_one(doc! {"_id": object_id}, update, None).await {
        Ok(_) => HttpResponse::Ok().json(doc! {"message": "Updated successfully"}),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

// DELETE /api/admin/menu/{id} (Admin only)
pub async fn delete_menu_item(client: web::Data<Client>, path: web::Path<String>) -> impl Responder {
    let id = path.into_inner();
    let object_id = match ObjectId::parse_str(&id) {
        Ok(oid) => oid,
        Err(_) => return HttpResponse::BadRequest().body("Invalid ID"),
    };

    let collection = get_menu_collection(&client);
    match collection.delete_one(doc! {"_id": object_id}, None).await {
        Ok(_) => HttpResponse::Ok().json(doc! {"message": "Deleted successfully"}),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}
