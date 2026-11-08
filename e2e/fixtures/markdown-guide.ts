export const MARKDOWN_GUIDE_FIXTURE = `# Configurable document guide

## Main section

### Useful detail

#### Deeper heading stays in the document

<p title="Important paragraph">A selected paragraph remains readable when the guide is used on a narrow or unfolded screen.</p>

<p title="${"LongNavigationLabel".repeat(12)}">Long labels wrap without widening the document.</p>

<table title="Guide table"><thead><tr><th>Setting</th><th>Value</th></tr></thead><tbody><tr><td>Guide</td><td>Enabled</td></tr></tbody></table>

<pre title="Guide code sample"><code class="language-json">{"guide": true}</code></pre>

![Guide illustration](https://example.com/guide-image.svg)

<details><summary>More details</summary><p id="hidden-detail">A target inside a collapsed disclosure.</p></details>

<p id="repeat">First repeated destination.</p>
<p id="repeat">Second repeated destination.</p>
`;
