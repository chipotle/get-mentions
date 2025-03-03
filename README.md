# get-mentions

Client-side JavaScript include for displaying Webmentions from Webmention.io

## Description

[Webmentions][1] are a method for enabling cross-site conversations across websites. They allow websites, including social media sites like Mastodon and Bluesky, to propagate likes, reposts, and replies to other websites by linking to them. This small JavaScript file allows static websites to display mentions of their site sent to [Webmention.io][2], a free hosted service that receives webmentions on their behalf.

[1]: https://indieweb.org/Webmention
[2]: https://webmention.io

## Usage

1. Register your site with Webmention.io, following its directions.

2. On every page you want to recieve webmentions, add the provided `<link>` and the script include to the page's `<head>`. It will look something like this:

    ```html
    <link rel="webmention" href="https://webmention.io/username/webmention">
    ```

    And the JavaScript include:

    ```html
    <script src="/path/to/get-mentions.min.js" async></script>
    ```

3. At the point on the page you want the webmentions to appear, include an empty `<div>` with the `webmentions` ID:

    ```html
    <div id="webmentions"></div>
    ```

## Configuration

The script recieves likes, reposts (boosts, reblogs, etc.), replies, and mentions (links from other websites, such as articles that link to yours). As configured out of the box, it displays all of them, but you can suppress the display of any type by changing the `defaultConfig` value toward the top of the script:

```javascript
const defaultConfig = {
    likes: true,
    reposts: true,
    replies: true,
    mentions: true,
}
```

If you set any of those to `false`, the counts and blocks won't be displayed.

You can also override any of those by adding a `data-*` attribute to the `<div>` tag, with the `*` being one of the configuration values (`likes`, `reposts`, `replies`, or `mentions`). If you don't want to display replies on a specific page, for example:

```html
<div id="webmentions" data-replies="false"></div>
```

Or, for another example, you've turned off likes in `defaultConfig` with `likes: false`, you can display them on a page by setting `data-replies="true"`.

**Note:** As written, any value other than `true` for a `data-*` attribute will be interpreted as `false`.

## Styling

Check the example `index.html` file for an example.

* The line with summary counts is tagged with `<p class="mention-counts">`; each individual count is tagged with `<span>...</span>`.
* Each block under the count is headlined with an `<h2>` tag.
* Every list is in a `<ul>` with each item in `<li>`.
* The likes and reposts are in `<div class="likes">` blocks, and the items are just avatar icons; replies and mentions are in `<div class="replies">` blocks, and the items are avatar icons, usernames (in `<span class="author-name">`), and the text of the reply/mention (in `<span class="reply-text">`).

## Version History

1.0.0, 2025-03-03: Initial release

## License

Copyright (c) 2025 Watts Martin

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
