use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use reqwest::Client;
use chrono::Utc;
use base64::{Engine as _, engine::general_purpose};
use std::env;

#[derive(Deserialize)]
pub struct StkPushRequest {
    pub phone_number: String,
    pub amount: u32,
}

#[derive(Serialize)]
pub struct StkPushResponse {
    pub message: String,
    pub merchant_request_id: Option<String>,
    pub checkout_request_id: Option<String>,
    pub response_code: Option<String>,
    pub response_description: Option<String>,
    pub customer_message: Option<String>,
}

#[derive(Deserialize)]
struct AccessTokenResponse {
    access_token: String,
    #[serde(rename = "expires_in")]
    _expires_in: String,
}

// Helper to get Access Token
async fn get_access_token(client: &Client) -> Result<String, String> {
    let consumer_key = env::var("MPESA_CONSUMER_KEY").map_err(|_| "MPESA_CONSUMER_KEY not set")?;
    let consumer_secret = env::var("MPESA_CONSUMER_SECRET").map_err(|_| "MPESA_CONSUMER_SECRET not set")?;
    let auth_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    let res = client
        .get(auth_url)
        .basic_auth(consumer_key, Some(consumer_secret))
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    if res.status().is_success() {
        let body: AccessTokenResponse = res.json().await.map_err(|e| format!("Failed to parse JSON: {}", e))?;
        Ok(body.access_token)
    } else {
        Err(format!("Failed to get access token: {}", res.status()))
    }
}

pub async fn send_stk_push(phone_number: &str, amount: u32) -> Result<StkPushResponse, String> {
    let client = Client::new();

    // 1. Get Access Token
    let access_token = get_access_token(&client).await?;

    // 2. Prepare STK Push Data
    let shortcode = env::var("MPESA_SHORTCODE").unwrap_or_else(|_| "174379".to_string()); // Default sandbox shortcode
    let passkey = env::var("MPESA_PASSKEY").unwrap_or_else(|_| "".to_string());
    let timestamp = Utc::now().format("%Y%m%d%H%M%S").to_string();
    let password_str = format!("{}{}{}", shortcode, passkey, timestamp);
    let password = general_purpose::STANDARD.encode(password_str);
    
    let callback_url = env::var("MPESA_CALLBACK_URL").unwrap_or_else(|_| "https://mydomain.com/path".to_string());

    let stk_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    let body = serde_json::json!({
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number, // Phone number sending money
        "PartyB": shortcode,        // Shortcode receiving money
        "PhoneNumber": phone_number,
        "CallBackURL": callback_url,
        "AccountReference": "YettaPastries",
        "TransactionDesc": "Payment for Order"
    });

    // 3. Send Request
    let res = client
        .post(stk_url)
        .bearer_auth(access_token)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    if res.status().is_success() {
        let json_res: serde_json::Value = res.json().await.unwrap_or_default();
        Ok(StkPushResponse {
            message: "STK Push initiated successfully".to_string(),
            merchant_request_id: json_res["MerchantRequestID"].as_str().map(|s| s.to_string()),
            checkout_request_id: json_res["CheckoutRequestID"].as_str().map(|s| s.to_string()),
            response_code: json_res["ResponseCode"].as_str().map(|s| s.to_string()),
            response_description: json_res["ResponseDescription"].as_str().map(|s| s.to_string()),
            customer_message: json_res["CustomerMessage"].as_str().map(|s| s.to_string()),
        })
    } else {
        let error_text = res.text().await.unwrap_or_default();
        log::error!("STK Push Failed: {}", error_text);
        Err(format!("STK Push failed: {}", error_text))
    }
}

pub async fn initiate_stk_push(req: web::Json<StkPushRequest>) -> impl Responder {
    match send_stk_push(&req.phone_number, req.amount).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => HttpResponse::BadRequest().json(StkPushResponse {
            message: e,
            merchant_request_id: None,
            checkout_request_id: None,
            response_code: None,
            response_description: None,
            customer_message: None,
        })
    }
}
