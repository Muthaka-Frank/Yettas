function setThemeBasedOnTime() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) { 
        alert("Good Morning");
    } else if (hour >= 12 && hour < 18) {
        alert("Good Afternoon"); 
    }
}
setThemeBasedOnTime();