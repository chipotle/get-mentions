/**
 * Webmention processing script
 * Watts Martin, 2 Mar 2025
 *
 * This works with Webmention.io, and displays likes, reposts/boosts,
 * replies, and mentions for individual pages on your website. Just
 * include the JavaScript file in the page's head, and put an empty
 * <div id="webmentions"></div> element on the page where you want
 * webmentions to be displayed. Consult the README file for docs.
 */
/** Default configuration options */
const defaultConfig = {
    likes: true,
    reposts: true,
    replies: true,
    mentions: true,
};
/** Referring URL */
const refUrl = window.location.href.replace(/#.$/, '');
/** API base URL */
const apiUrl = 'https://webmention.io/api/';
/** Placeholder image for missing avatars */
const imagePlaceholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAAAAXNSR0IArs4c6QAAAGBQTFRFkpKS/v7+k5OTh4eH/f39i4uLlZWV////kZGRlpaWhISEcHBwgYGB8fHxrKysSEhIAAAA6urqycnJ1tbW39/f+Pj4e3t7V1dXtbW1o6OjOTk5v7+/ZWVlmpqaKCgoBQUFhqYYcQAAAmdJREFUaN7tl0mSHSEMREFIpKDmef59/1t6UdVth72FjaPeATIDSWgw5uXl5eXl5eXlH4iIiHKJe1IREVHy6T2USMqo11bX2yVRyCfW91JufTcBlnnqhlokpNV3fuRqHMYKsAAwbtFrOgPvtqm7ms9nX7YKbBngtQzJHEg2Hpq9KEXi6SpYWAZSOriu25foA1G45hXWAoxJXKJMk1shbRnEkSqpqcAAGH0REmW4HKuvuqq6Q0gNxQEWAKMqHCV6QTU6wN5hD7GHBWABKRJlQSuewJYxnmRCPO5KZWxLGgOSu/otusV5/9ugbnyaLuFGMACLbi+9f0IERt0kyoHUADMzjtbRd5LBuBIZGHIHAKBrGiHV7nkP5iWVAcWrH4Z1/8zGu9o+ZdrtRbK2HeLSfNplViI3gO8IHW1JqZqFhqCiagzJzwOms5FkBkYNERmjJN33A+p2Tjtz1Bj945cN7SmpJ6d62aYnQOOniaSJDej5cpYx7vtskuPdAWvBFv3XPmtyfVKqwGDgaJsyx2Lkjlu/bpcc+oakg2UwtaejLPo1wJjmDPV5f+bYgzEVbSGkeQwGWGgu/dsAfXtm0n9CNO+59I16V6NrTp9J3xijOlXNHLIZqC8HFEU+A0NyYV2CyYePR71kvQG9FIVSvhCREykd5apTUlnHbjxEMzmQ3CvdKCZLlELsnwWyn0OWAOn3ZVMVOdr1z0JhYcscv+1PgzlHQyLz7HSMqilydDzvVsBaBtaES+9f1+wEAEe7ZJnJRn0Z67Uu2iXm6tdBzmZvCpdv4vgreDL5up1RvW+Fl5eXl5eXl5f/kF9OTiClUC4P7gAAAABJRU5ErkJggg==';
/** Global configuration object */
let config = {};
/** Main execution function, attached to load handler */
window.addEventListener('load', async function () {
    const container = this.document.getElementById('webmentions');
    if (!container) {
        return;
    }
    /** Check for configuration overrides */
    Object.entries(defaultConfig).forEach(function ([k, v]) {
        if (container.hasAttribute(`data-${k}`)) {
            config[k] = container.getAttribute(`data-${k}`) === "true";
        }
        else {
            config[k] = v;
        }
    });
    const counts = await getCounts(refUrl);
    const mentions = await getAllMentions(counts?.count, refUrl);
    let html = formatCounts(counts);
    if (counts.type['like'] && config['likes']) {
        html += `<div class="likes"><h2>Likes</h2>${formatLikes(mentions, 'like-of')}</div>`;
    }
    if (counts.type['repost'] && config['reposts']) {
        html += `<div class="likes"><h2>Reposts</h2>${formatLikes(mentions, 'repost-of')}</div>`;
    }
    if (counts.type['reply'] && config['replies']) {
        html += `<div class="replies"><h2>Replies</h2>${formatReplies(mentions, 'in-reply-to')}</div>`;
    }
    if (counts.type['mention'] && config['mentions']) {
        html += `<div class="replies"><h2>Mentions</h2>${formatMentions(mentions, 'mention-of')}</div>`;
    }
    container.innerHTML = html;
});
/**
 * Fetch a response from a web API as JSON
 *
 * @param {string} url URL to send request to
 * @returns {object} JSON response object
 */
async function fetchResponse(url) {
    let json = {};
    try {
        const response = await fetch(apiUrl + url);
        if (!response.ok) {
            throw new Error(`fetchResponse received HTTP status ${response.status}`);
        }
        json = response.json();
        return json;
    }
    catch (error) {
        console.error('Request failed:', error.message);
    }
}
/**
 * Get count of webmentions for a given page
 *
 * @param {string} url URL of page to get mention counts for
 * @returns {object} Webmention counter object
 */
async function getCounts(url) {
    const counts = fetchResponse('count?target=' + url);
    return counts;
}
/**
 * Get all the webmention entry objects for a given page
 *
 * @param pageSize Number of mentions to return in single request
 * @param url URL of page to get mentions for
 * @returns {array} Array of webmention entries
 */
async function getAllMentions(pageSize, url) {
    const mentions = await fetchResponse(`mentions.jf2?target=${url}&sort-by=published&sort-dir=up&per-page=${pageSize}`);
    return mentions?.children;
}
/**
 * Format an HTML string with webmention counts by type
 *
 * @param {object} counts Webmention counter object to parse
 * @returns {string}
 */
function formatCounts(counts) {
    const replies = counts.type.reply;
    const mentions = counts.type.mention;
    const likes = counts.type.like;
    const reposts = counts.type.repost;
    let result = '';
    if (likes && config['likes']) {
        const text = likes > 1 ? 'Likes' : 'Like';
        result = `<span>${likes} ${text}</span> `;
    }
    if (reposts && config['reposts']) {
        const text = reposts > 1 ? 'Reposts' : 'Repost';
        result += `<span>${reposts} ${text}</span> `;
    }
    if (replies && config['replies']) {
        const text = replies > 1 ? 'Replies' : 'Reply';
        result += `<span>${replies} ${text}</span> `;
    }
    if (mentions && config['mentions']) {
        const text = mentions > 1 ? 'Mentions' : 'Mention';
        result += `<span>${mentions} ${text}</span>`;
    }
    if (result) {
        return `<p class="mention-counts">${result}</p>`;
    }
    else {
        return '';
    }
}
/**
 * Filter webmentions by type
 *
 * @param {array} mentions Webmention entries
 * @param wmType Type of webmention to select
 * @returns {array}
 */
function getMentions(mentions, wmType) {
    const entries = mentions.filter((x) => x['wm-property'] === wmType);
    return entries;
}
/**
 * Format an HTML string listing user icons for likes/reposts
 *
 * @param mentions Webmention entries to loop over
 * @param wmType Type of webmention to select
 * @returns {string}
 */
function formatLikes(mentions, wmType) {
    const likes = getMentions(mentions, wmType);
    let result = '<ul>';
    likes.forEach((like) => {
        const author = like.author.name || like.author.url;
        const imageSrc = like.author.photo || imagePlaceholder;
        result += `<li><a href="${like.author.url}" title="${author}" rel="nofollow"><img src="${imageSrc}"></a></li>`;
    });
    return `${result}</ul>`;
}
/**
 * Format an HTML string listing replies by user
 *
 * @param mentions Webmention entries to loop over
 * @param wmType Type of webmention to select
 * @returns {string}
 */
function formatReplies(mentions, wmType) {
    const replies = getMentions(mentions, wmType);
    let result = '<ul>';
    replies.forEach((reply) => {
        const author = reply.author.name || reply.author.url;
        const imageSrc = reply.author.photo || imagePlaceholder;
        result += `<li><a href="${reply.url}" rel="nofollow"><img src="${imageSrc}"> <span class="author-name">${author}:</span></a> <span class="reply-text">${reply.content.text}<span></li>`;
    });
    return `${result}</ul>`;
}
/**
 * Format an HTML string listing mentions by user
 *
 * @param mentions Webmention entries to loop over
 * @param wmType Type of webmention to select
 * @returns {string}
 */
function formatMentions(mentions, wmType) {
    const replies = getMentions(mentions, wmType);
    let result = '<ul>';
    replies.forEach((reply) => {
        const author = reply.author.name || reply.author.url;
        const imageSrc = reply.author.photo || imagePlaceholder;
        const replyText = reply.summary.value || reply.content.text.replace(/\s+/g, ' ').split(' ', 50) + '&hellip;';
        result += `<li><a href="${reply.url}" rel="nofollow"><img src="${imageSrc}"> <span class="author-name">${author}:</span></a> <span class="reply-text">${replyText}<span></li>`;
    });
    return `${result}</ul>`;
}
//# sourceMappingURL=get-mentions.js.map