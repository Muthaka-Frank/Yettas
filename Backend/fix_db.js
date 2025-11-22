// Delete users who have no password hash AND no google_id
// These are the users affected by the bug where password_hash wasn't saved.
db.users.deleteMany({
    password_hash: null,
    google_id: null
});

print("Cleaned up broken user accounts.");
