/**
 * Generate Farcaster Frame v2 HTML response
 * Based on Farcaster Frame specification
 */

interface FrameButton {
    label: string;
    action?: 'post' | 'post_redirect' | 'link' | 'mint';
    target?: string;
}

interface FrameOptions {
    image: { src: string; aspectRatio?: '1:1' | '1.91:1' };
    buttons?: FrameButton[];
    input?: { text: string };
    state?: Record<string, unknown>;
    postUrl?: string;
}

/**
 * Generate Farcaster Frame HTML response
 * 
 * @param options - Frame configuration options
 * @returns HTML string for Farcaster Frame
 */
export function getFrameHtmlResponse(options: FrameOptions): string {
    const { image, buttons = [], input, state, postUrl } = options;
    
    // Build meta tags
    const metaTags = [
        `<meta property="fc:frame" content="vNext" />`,
        `<meta property="og:image" content="${image.src}" />`,
        `<meta property="fc:frame:image" content="${image.src}" />`,
    ];

    if (image.aspectRatio) {
        metaTags.push(`<meta property="fc:frame:image:aspect_ratio" content="${image.aspectRatio}" />`);
    }

    if (postUrl) {
        metaTags.push(`<meta property="fc:frame:post_url" content="${postUrl}" />`);
    }

    // Add buttons
    buttons.forEach((button, index) => {
        const buttonIndex = index + 1;
        metaTags.push(`<meta property="fc:frame:button:${buttonIndex}" content="${button.label}" />`);
        
        if (button.action) {
            metaTags.push(`<meta property="fc:frame:button:${buttonIndex}:action" content="${button.action}" />`);
        }
        
        if (button.target) {
            metaTags.push(`<meta property="fc:frame:button:${buttonIndex}:target" content="${button.target}" />`);
        }
    });

    // Add input field if provided
    if (input) {
        metaTags.push(`<meta property="fc:frame:input:text" content="${input.text}" />`);
    }

    // Add state if provided
    if (state) {
        const stateJson = JSON.stringify(state);
        metaTags.push(`<meta property="fc:frame:state" content='${stateJson}' />`);
    }

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Base Standard</title>
    ${metaTags.join('\n    ')}
</head>
<body>
    <img src="${image.src}" alt="Frame Image" />
</body>
</html>`;
}
