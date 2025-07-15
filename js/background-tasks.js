// Background Tasks API implementation

// Queue to store tasks
const taskQueue = [];

// Flag to check if task processor is currently running
let isProcessing = false;

// Initialize background tasks functionality
function initBackgroundTasks() {
    console.log("Initializing Background Tasks API");
    
    // Check if requestIdleCallback is available
    if (!('requestIdleCallback' in window)) {
        // Fallback for browsers that don't support requestIdleCallback
        console.warn('Background Tasks API not supported. Using setTimeout as fallback.');
    }
    
    // Process any tasks that might be already in the queue
    if (taskQueue.length > 0 && !isProcessing) {
        processTaskQueue();
    }
}

// Schedule a task to run in the background
function scheduleBackgroundTask(task, options = {}) {
    if (typeof task !== 'function') {
        console.error('Task must be a function');
        return;
    }
    
    // Add task to queue
    taskQueue.push({
        task,
        priority: options.priority || 'normal', // 'high', 'normal', or 'low'
        deadline: options.deadline || 50, // Default 50ms time allocation
        id: Date.now().toString(36) + Math.random().toString(36).substring(2)
    });
    
    // Start processing if not already started
    if (!isProcessing) {
        processTaskQueue();
    }
}

// Process the task queue during idle time
function processTaskQueue() {
    if (taskQueue.length === 0) {
        isProcessing = false;
        return;
    }
    
    isProcessing = true;
    
    // Sort tasks by priority
    taskQueue.sort((a, b) => {
        const priorityValues = { high: 3, normal: 2, low: 1 };
        return priorityValues[b.priority] - priorityValues[a.priority];
    });
    
    // Use requestIdleCallback if available, otherwise use setTimeout
    if ('requestIdleCallback' in window) {
        requestIdleCallback(processTasksWithDeadline);
    } else {
        setTimeout(processTasksWithoutDeadline, 0);
    }
}

// Process tasks with idle time consideration
function processTasksWithDeadline(deadline) {
    while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && taskQueue.length > 0) {
        const taskInfo = taskQueue.shift();
        
        try {
            console.log(`Executing background task (${taskInfo.priority})`);
            const startTime = performance.now();
            taskInfo.task();
            const endTime = performance.now();
            console.log(`Task completed in ${(endTime - startTime).toFixed(2)}ms`);
        } catch (error) {
            console.error('Error in background task:', error);
        }
    }
    
    // Continue processing if there are more tasks
    if (taskQueue.length > 0) {
        requestIdleCallback(processTasksWithDeadline);
    } else {
        isProcessing = false;
    }
}

// Fallback for browsers without requestIdleCallback
function processTasksWithoutDeadline() {
    // Process a batch of tasks (limit to prevent UI blocking)
    const batchSize = 3;
    const tasksToProcess = Math.min(batchSize, taskQueue.length);
    
    for (let i = 0; i < tasksToProcess; i++) {
        const taskInfo = taskQueue.shift();
        
        try {
            console.log(`Executing background task (${taskInfo.priority}) using fallback`);
            const startTime = performance.now();
            taskInfo.task();
            const endTime = performance.now();
            console.log(`Task completed in ${(endTime - startTime).toFixed(2)}ms`);
        } catch (error) {
            console.error('Error in background task:', error);
        }
    }
    
    // Continue processing if there are more tasks
    if (taskQueue.length > 0) {
        setTimeout(processTasksWithoutDeadline, 0);
    } else {
        isProcessing = false;
    }
}

// Process data in chunks to avoid UI freezing
function processDataInChunks(data, processFn, chunkSize = 100, onComplete) {
    if (!Array.isArray(data) || typeof processFn !== 'function') {
        console.error('Invalid arguments for processDataInChunks');
        return;
    }
    
    let index = 0;
    
    function processNextChunk() {
        const chunk = data.slice(index, index + chunkSize);
        index += chunkSize;
        
        if (chunk.length > 0) {
            try {
                processFn(chunk);
            } catch (error) {
                console.error('Error processing data chunk:', error);
            }
            
            if (index < data.length) {
                // Schedule next chunk
                scheduleBackgroundTask(processNextChunk, { priority: 'normal' });
            } else if (typeof onComplete === 'function') {
                // All chunks processed
                onComplete();
            }
        } else if (typeof onComplete === 'function') {
            // No more chunks
            onComplete();
        }
    }
    
    // Start processing
    scheduleBackgroundTask(processNextChunk, { priority: 'normal' });
}

// Example of a computationally expensive task that can be run in the background
function calculateRouteInBackground(startPoint, endPoint, waypoints = [], callback) {
    // This would be a complex path-finding algorithm in a real application
    scheduleBackgroundTask(() => {
        console.log('Calculating route in background...');
        
        // Simulate complex calculation with setTimeout
        setTimeout(() => {
            // Mock route result
            const route = {
                distance: Math.random() * 10 + 1, // km
                duration: Math.random() * 60 + 10, // minutes
                path: generateMockPath(startPoint, endPoint, waypoints)
            };
            
            if (typeof callback === 'function') {
                callback(route);
            }
        }, 1500);
    }, { priority: 'normal' });
}

// Helper function to generate a mock path
function generateMockPath(start, end, waypoints) {
    const path = [];
    
    // Add start point
    path.push(start);
    
    // Add waypoints
    path.push(...waypoints);
    
    // Add some random points between to simulate a route
    const pointCount = 10;
    for (let i = 0; i < pointCount; i++) {
        const ratio = (i + 1) / (pointCount + 1);
        
        // Linear interpolation between start and end
        const lat = start.lat + ratio * (end.lat - start.lat);
        const lng = start.lng + ratio * (end.lng - start.lng);
        
        // Add some randomness to make it look like a real route
        const jitter = 0.002;
        path.push({
            lat: lat + (Math.random() * jitter - jitter/2),
            lng: lng + (Math.random() * jitter - jitter/2)
        });
    }
    
    // Add end point
    path.push(end);
    
    return path;
}

// Make functions available globally
window.backgroundTasks = {
    scheduleBackgroundTask,
    processDataInChunks,
    calculateRouteInBackground
};

// Make the main function available globally for other scripts
window.scheduleBackgroundTask = scheduleBackgroundTask;