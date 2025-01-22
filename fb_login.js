// Initialize the Facebook SDK with error handling
window.fbAsyncInit = function() {
    try {
        FB.init({
            appId: '1671827080068837', // Replace with your Facebook App ID
            cookie: true,
            xfbml: true,
            version: 'v22.0'
        });
        
        // Check initial login status
        checkLoginState();
        
        console.log('Facebook SDK initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Facebook SDK:', error);
        handleSDKError();
    }
};

// Load the Facebook SDK asynchronously with timeout and error handling
(function loadFacebookSDK(d, s, id) {
    return new Promise((resolve, reject) => {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        
        js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        
        // Add error handling for script loading
        js.onerror = function() {
            console.error('Failed to load Facebook SDK');
            handleSDKError();
            reject(new Error('Failed to load Facebook SDK'));
        };
        
        // Add timeout
        const timeout = setTimeout(() => {
            console.error('Facebook SDK load timeout');
            handleSDKError();
            reject(new Error('Facebook SDK load timeout'));
        }, 5000); // 5 second timeout
        
        js.onload = function() {
            clearTimeout(timeout);
            resolve();
        };
        
        fjs.parentNode.insertBefore(js, fjs);
    });
})(document, 'script', 'facebook-jssdk');

// Handle SDK loading errors
function handleSDKError() {
    // Check if the user is offline
    if (!navigator.onLine) {
        showError('Please check your internet connection');
        return;
    }
    
    // Check if there might be a content blocker
    if (window.localStorage && !localStorage.getItem('fb-check')) {
        showError('If you are using an ad blocker, you may need to disable it for Facebook login to work');
        localStorage.setItem('fb-check', 'true');
    }
    
    // Display error message to user
    const errorContainer = document.getElementById('fb-error-container') || createErrorContainer();
    errorContainer.style.display = 'block';
}

// Create error container if it doesn't exist
function createErrorContainer() {
    const container = document.createElement('div');
    container.id = 'fb-error-container';
    container.style.cssText = 'background: #ffebee; color: #c62828; padding: 10px; margin: 10px 0; border-radius: 4px; display: none;';
    document.body.insertBefore(container, document.body.firstChild);
    return container;
}

// Show error message to user
function showError(message) {
    const errorContainer = document.getElementById('fb-error-container') || createErrorContainer();
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
}

// Handle the login status change with error handling
function statusChangeCallback(response) {
    try {
        if (response.status === 'connected') {
            console.log('Successfully logged in with Facebook');
            console.log('Access Token:', response.authResponse.accessToken);
            console.log('User ID:', response.authResponse.userID);
            handleSuccessfulLogin(response);
        } else if (response.status === 'not_authorized') {
            showError('Please log into this app.');
        } else {
            showError('Please log into Facebook.');
        }
    } catch (error) {
        console.error('Error in status change callback:', error);
        showError('An error occurred while processing login status');
    }
}

// Check login state with error handling
function checkLoginState() {
    if (typeof FB === 'undefined') {
        console.error('Facebook SDK not loaded');
        showError('Unable to connect to Facebook. Please try refreshing the page.');
        return;
    }

    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

// Handle successful login
function handleSuccessfulLogin(response) {
    FB.api('/me', function(response) {
        if (response && !response.error) {
            console.log('Successful login for: ' + response.name);
            // Hide any error messages
            const errorContainer = document.getElementById('fb-error-container');
            if (errorContainer) {
                errorContainer.style.display = 'none';
            }
        } else {
            console.error('Error getting user info:', response.error);
            showError('Failed to get user information');
        }
    });
}

// Function to handle manual login with error handling
function handleLogin() {
    if (typeof FB === 'undefined') {
        showError('Unable to connect to Facebook. Please try refreshing the page.');
        return;
    }

    FB.login(function(response) {
        statusChangeCallback(response);
    }, {scope: 'public_profile,email'});
}
