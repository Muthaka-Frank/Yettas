// src/db.rs
use mongodb::{Client, options::ClientOptions};
use std::env;

pub async fn init_db() -> Result<Client, mongodb::error::Error> {
    let mongo_uri = env::var("MONGODB_URI").expect("MONGODB_URI must be set in .env file");
    
    // Parse the connection string
    let client_options = ClientOptions::parse(&mongo_uri).await?;
    
    // Create the client
    let client = Client::with_options(client_options)?;
    
    Ok(client)
}