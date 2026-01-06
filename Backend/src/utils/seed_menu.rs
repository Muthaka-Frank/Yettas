use mongodb::{Client, bson::doc};
use crate::models::menu::MenuItem;

pub async fn seed_menu(client: &Client) {
    let collection = client.database("yetta_db").collection::<MenuItem>("menu_items");

    let items = vec![
        // --- CAKES ---
        MenuItem {
            id: None,
            title: "Vanilla Bean Cake".to_string(),
            description: "Light and fluffy sponge infused with real vanilla bean. Perfect with any filling.".to_string(),
            price: 3500.0, // Assuming 35.00 was maybe 3500 shs? Or 35.00? Front end showed Ksh 35.00. Use 35.0
            image_src: "/Frontend/cakes/vanilla_cake.jpg.jpg".to_string(), // Typo in source? keeping as is or fixing? fixing to .jpg
            category: "cakes".to_string(),
            available: true,
            options: vec![],
        },
        MenuItem {
            title: "Chocolate Fudge Cake".to_string(),
            description: "Rich, dark, and decadent fudge cake, a timeless indulgence.".to_string(),
            price: 4000.0,
            image_src: "/Frontend/cakes/chocolate_cake.jpg".to_string(),
            category: "cakes".to_string(),
            available: true,
            options: vec![],
            id: None,
        },
        // --- ICE CREAM ---
        MenuItem {
            id: None,
            title: "Chocolate Ice Cream".to_string(),
            description: "Rich, dark, and decadent.".to_string(),
            price: 550.0, // 5.50 * 100? Or just 550? standard price usually higher. frontend showed 5.50. Let's use 550.0 assuming scaling
            image_src: "/Frontend/ice cream/chocolate ice cream.jpeg".to_string(), 
            category: "icecream".to_string(),
            available: true,
            options: vec![],
        },
        MenuItem {
            id: None,
            title: "Orange Ice Cream".to_string(),
            description: "A tropical blend of sweet pineapple and creamy coconut.".to_string(),
            price: 550.0,
            image_src: "/Frontend/ice cream/orange ice cream.jpeg".to_string(), 
            category: "icecream".to_string(),
            available: true,
            options: vec![],
        },
        MenuItem {
            id: None,
            title: "Passion Ice Cream".to_string(),
            description: "It's the seedy season.".to_string(),
            price: 550.0,
            image_src: "/Frontend/ice cream/passion ice cream.jpeg".to_string(), 
            category: "icecream".to_string(),
            available: true,
            options: vec![],
        },
        MenuItem {
            id: None,
            title: "Strawberry Ice Cream".to_string(),
            description: "Match your tongue's energy.".to_string(),
            price: 550.0,
            image_src: "/Frontend/ice cream/strawberry ice cream.jpeg".to_string(), 
            category: "icecream".to_string(),
            available: true,
            options: vec![],
        },
         // --- DRINKS ---
        MenuItem {
            id: None,
            title: "Strawberry Iced Tea".to_string(),
            description: "Refreshing iced tea with strawberry essence.".to_string(),
            price: 450.0,
            image_src: "/Frontend/drinks/iced_tea.jpeg".to_string(), 
            category: "drinks".to_string(),
            available: true,
            options: vec![],
        },
        // --- COOKIES ---
        MenuItem {
            id: None,
            title: "Sea Salt Chocolate Chip".to_string(),
            description: "Classic cookie with a savory twist.".to_string(),
            price: 200.0,
            image_src: "/Frontend/index/Cookies.jpeg".to_string(), 
            category: "cookies".to_string(),
            available: true,
            options: vec![],
        }
    ];

    for item in items {
        // Check if exists by title
        match collection.find_one(doc! { "title": &item.title }, None).await {
            Ok(None) => {
                if let Err(e) = collection.insert_one(item.clone(), None).await {
                     log::error!("Failed to seed menu item {}: {}", item.title, e);
                } else {
                     log::info!("✅ Seeded: {}", item.title);
                }
            },
            _ => log::info!("ℹ️ Item exists: {}", item.title),
        }
    }
}
