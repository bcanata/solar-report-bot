// ============================================================================
// CONSTANTS
// ============================================================================

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Validates required environment variables
 * @param {object} env - Environment variables
 * @throws {Error} If required environment variables are missing
 */
function validateEnv(env) {
    const required = {
        TELEGRAM_BOT_TOKEN: 'Telegram bot token',
        TARGET_CHAT_ID: 'Target chat ID',
        MASTER_ID: 'Master user ID for error notifications'
    };

    const missing = [];
    for (const [key, description] of Object.entries(required)) {
        if (!env[key]) {
            missing.push(`${key} (${description})`);
        }
    }

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables:\n- ${missing.join('\n- ')}`);
    }
}

/**
 * Gets configuration from environment
 * @param {object} env - Environment variables
 * @returns {object} Configuration object
 */
const getConfig = (env) => ({
    token: env.TELEGRAM_BOT_TOKEN,
    targetChatId: env.TARGET_CHAT_ID,
    masterId: parseInt(env.MASTER_ID, 10),
    solarDataUrl: 'https://www.hamqsl.com/solarvhf.php'
});

// ============================================================================
// TELEGRAM API
// ============================================================================

/**
 * Makes a request to the Telegram Bot API
 * @param {string} method - API method name (e.g., 'sendMessage', 'sendPhoto')
 * @param {object} data - Request payload
 * @param {object} env - Environment variables
 * @returns {Promise<object>} API response
 * @throws {Error} If the API request fails
 */
async function telegramApi(method, data, env) {
    const config = getConfig(env);
    const url = `${TELEGRAM_API_BASE}${config.token}/${method}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!result.ok) {
        const error = new Error(`Telegram API error: ${result.description}`);
        error.telegramCode = result.error_code;
        error.telegramResponse = result;
        throw error;
    }

    return result;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Reports an error to the master user via Telegram
 * @param {Error} error - The error to report
 * @param {string} context - Context where the error occurred
 * @param {object} env - Environment variables
 */
async function reportError(error, context, env) {
    const config = getConfig(env);

    const errorMessage = [
        `🚨 Error in ${context}`,
        `Time: ${new Date().toISOString()}`,
        `Message: ${error.message}`,
        error.telegramCode ? `Telegram Code: ${error.telegramCode}` : ''
    ].filter(Boolean).join('\n');

    try {
        await fetch(`${TELEGRAM_API_BASE}${config.token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: config.masterId,
                text: errorMessage
            })
        });
    } catch (reportError) {
        // Cannot report the error - log it
        console.error('Failed to report error:', reportError);
        console.error('Original error:', error);
    }
}

// ============================================================================
// MAIN HANDLERS
// ============================================================================

/**
 * Sends the daily solar data report to the target chat
 * @param {Date} scheduledTime - The scheduled execution time
 * @param {object} env - Environment variables
 */
async function sendSolarReport(scheduledTime, env) {
    const config = getConfig(env);

    try {
        // Send text message
        await telegramApi('sendMessage', {
            chat_id: config.targetChatId,
            text: 'Günlük Solar Veriler:'
        }, env);

        // Send solar data photo with cache-busting timestamp
        await telegramApi('sendPhoto', {
            chat_id: config.targetChatId,
            photo: `${config.solarDataUrl}?t=${Date.now()}`
        }, env);

        console.log(`Solar report sent at ${scheduledTime.toISOString()}`);
        return new Response('OK', { status: 200 });

    } catch (error) {
        await reportError(error, 'sendSolarReport', env);
        return new Response('Error', { status: 500 });
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

export default {
    async scheduled(event, env, ctx) {
        validateEnv(env);
        await sendSolarReport(event.scheduledTime, env);
    }
};
