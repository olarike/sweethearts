const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    // Set the content type to XML
    res.setHeader('Content-Type', 'text/xml');
    
    // Example: Generate dynamic content (you can modify this based on your needs)
    const currentTime = new Date().toLocaleTimeString();
    const notifications = await getLatestNotifications(); // You would implement this

    // Create the tile update XML
    const tileXml = `<?xml version="1.0" encoding="utf-8"?>
        <tile>
            <visual version="2">
                <binding template="TileSquare150x150Text04" branding="name">
                    <text id="1">Latest Updates</text>
                    <text id="2">${notifications.length} new items</text>
                    <text id="3">Last updated: ${currentTime}</text>
                </binding>
                <binding template="TileWide310x150Text03" branding="name">
                    <text id="1">Latest Updates</text>
                    <text id="2">${notifications[0]?.title || 'No new updates'}</text>
                </binding>
            </visual>
        </tile>`;

    res.send(tileXml);
});

// Example helper function to get notifications
async function getLatestNotifications() {
    // Implement your logic to fetch notifications
    // This could be from a database, external API, etc.
    return [
        { title: 'New message from John', time: new Date() },
        { title: 'Meeting reminder', time: new Date() }
    ];
}

module.exports = router;