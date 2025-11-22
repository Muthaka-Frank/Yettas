// A simple array to simulate the shopping cart
let shoppingCart = [];

// A function to update the visible cart on the page for demonstration
function updateCartDisplay() {
    const displayElement = document.getElementById('cart-display');
    if (shoppingCart.length === 0) {
        displayElement.textContent = "Cart is empty.";
    } else {
        displayElement.textContent = JSON.stringify(shoppingCart, null, 2);
    }
}

// The core function to handle the button click
function handleAddToCart(event) {
    // 1. Get the data attributes from the clicked button
    const button = event.target;
    const id = button.getAttribute('data-product-id');
    const name = button.getAttribute('data-product-name');
    const price = parseFloat(button.getAttribute('data-product-price'));

    // 2. Check if the item is already in the cart
    const existingItem = shoppingCart.find(item => item.id === id);

    if (existingItem) {
        // If it exists, just increase the quantity
        existingItem.quantity += 1;
        console.log(`Increased quantity for ${name}.`);
    } else {
        // If it's a new item, add it to the cart
        shoppingCart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
        console.log(`Added ${name} to cart.`);
    }
    
    // 3. Update the display and give user feedback
    updateCartDisplay();
    alert(`Added 1 x ${name} to your cart!`);
}

// 4. Attach the event listener to all "Add to Cart" buttons
document.addEventListener('DOMContentLoaded', () => {
    const cartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    cartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
});

// Initial display setup
updateCartDisplay();