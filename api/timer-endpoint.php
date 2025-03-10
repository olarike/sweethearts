<?php
header('Content-Type: application/json');

// File to store the end time
$timerFile = __DIR__ . '/timer-data.json';

// If the file doesn't exist, create it with a default end time (15 minutes from now)
if (!file_exists($timerFile)) {
    $endTime = new DateTime();
    $endTime->modify('+15 minutes');
    
    $timerData = [
        'endTime' => $endTime->format('c'),
        'createdAt' => (new DateTime())->format('c')
    ];
    
    file_put_contents($timerFile, json_encode($timerData));
}

// Read the timer data
$timerData = json_decode(file_get_contents($timerFile), true);

// Return the timer data along with current server time
echo json_encode([
    'endTime' => $timerData['endTime'],
    'serverTime' => (new DateTime())->format('c')
]);
?> 