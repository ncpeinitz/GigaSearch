// Configuration
const API_KEY = '60acccf4ebabf2f4ed3f605ae7ae3f27c0f54f2e';

const BG_IMGs = [
    'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1920&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80',
    'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1920&q=80',
    'https://images.unsplash.com/photo-1543946207-39bd91e70ca7?w=1920&q=80'
];

let BG_Index = 0;

$(document).ready(function () {

    // Initialize time div as jQueryUI dialog
    $('#time').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        width: 260,
        buttons: {
            Close: function () { $(this).dialog('close'); }
        }
    });

    // Background cycling
    $('#siteName').click(function () {
        BG_Index = (BG_Index + 1) % BG_IMGs.length;
        $('body').css('background-image', 'url(' + BG_IMGs[BG_Index] + ')');
    });

    // Time Button
    $('#timeButton').click(function () {
        const now = new Date();
        const hr = String(now.getHours()).padStart(2, '0');
        const mi = String(now.getMinutes()).padStart(2, '0');
        $('#time').css('visibility', 'visible').html(hr + ':' + mi);
        $('#time').dialog('open');
    });

    // Trigger Search
    $('#searchButton').click(function () { doSearch(); });

    // Enter key support
    $('#query').keyup(function (e) {
        const Enter = 13;
        if (e.keyCode === Enter) { doSearch(); }
    });

    // Bonus Button
    $('#luckyButton').click(function () {
        const q = $('#query').val().trim();
        if (!q) { alert('Enter a search term first.'); return; }

        $.ajax({
            url: buildUrl(q),
            method: 'GET',
            dataType: 'json'
        }).done(function (data) {
            if (data.organic && data.organic.length > 0 && data.organic[0].link) {
                window.open(data.organic[0].link, '_blank');
            } else {
                alert('No results found to get lucky with!');
            }
        }).fail(function (jqXHR) {
            alert('Request failed: ' + getApiError(jqXHR));
        });
    });

    // Core search function
    function doSearch() {
        const q = $('#query').val().trim();
        if (!q) { alert('Please enter a search term.'); return; }

        // Show a loading state immediately
        $('#searchResults')
            .css('visibility', 'visible')
            .html('<p style="color:#cce0ff;text-align:center;padding:20px;">Searching...</p>');

        $.ajax({
            url: buildUrl(q),
            method: 'GET',
            dataType: 'json'
        }).done(function (data) {
            renderResults(data, q);
        }).fail(function (jqXHR) {
            const msg = getApiError(jqXHR);
            $('#searchResults').html(
                '<p style="color:#ff8080;background:rgba(0,0,0,0.6);' +
                'padding:16px;border-radius:8px;text-align:center;">' +
                '&#9888; Search failed: ' + escHtml(msg) + '</p>'
            );
        });
    }

    // Result Sections
    function renderResults(data, query) {
        let html = '';

        if (data.knowledgeGraph) {
            html += buildKnowledgeGraph(data.knowledgeGraph);
        }

        // You probably also want organic results here, but I’m leaving your structure

        if (!data.knowledgeGraph) {
            html += '<p style="color:#fff;text-align:center;padding:20px;">No results found for ' +
                escHtml(query) + '.</p>';
        }

        if (data.peopleAlsoAsk && data.peopleAlsoAsk.length > 0) {
            html += '<div class="section-label">People Also Ask</div>';
            data.peopleAlsoAsk.forEach(function (item) {
                html += buildPaaItem(item);
            });
        }

        if (data.relatedSearches && data.relatedSearches.length > 0) {
            html += '<div class="section-label">Related Searches</div>';
            html += '<div class="related-searches">';
            data.relatedSearches.forEach(function (item) {
                if (item && item.query) {
                    html += '<a class="related-link">' + escHtml(item.query) + '</a>';
                }
            });
            html += '</div>';
        }

        $('#searchResults').html(html).css('visibility', 'visible');

        $('.paa-item').click(function () {
            $(this).toggleClass('open');
            $(this).find('.paa-answer').slideToggle(200);
        });

        $('.related-link').click(function () {
            $('#query').val($(this).text());
            doSearch();
        });
    }

    function buildKnowledgeGraph(kg) {
        let h = '<div class="knowledge-graph">';
        if (kg.imageUrl) {
            h += '<img src="' + escHtml(kg.imageUrl) + '" alt="' + escHtml(kg.title || '') + '">';
        }
        h += '<div class="kg-text">';
        if (kg.title) h += '<h2>' + escHtml(kg.title) + '</h2>';
        if (kg.type) h += '<div class="kg-type">' + escHtml(kg.type) + '</div>';
        if (kg.description) h += '<p>' + escHtml(kg.description) + '</p>';
        if (kg.attributes && typeof kg.attributes === 'object') {
            const entries = Object.entries(kg.attributes);
            if (entries.length > 0) {
                h += '<div class="kg-attributes">';
                entries.forEach(function ([key, val]) {
                    h += '<span><strong>' + escHtml(key) + ':</strong> ' +
                        escHtml(String(val)) + '</span>';
                });
                h += '</div>';
            }
        }
        h += '</div></div>';
        return h;
    }

    function buildOrganicResult(r) {
        const link = r.link || '#';
        const title = r.title || 'No Title';
        const snippet = r.snippet || '';

        let h = '<div class="organic-result">';
        h += '<div class="result-url">' + escHtml(link) + '</div>';
        h += '<h3><a href="' + escHtml(link) + '" target="_blank">' +
            escHtml(title) + '</a></h3>';
        if (snippet) {
            h += '<p class="snippet">' + escHtml(snippet) + '</p>';
        }
        if (r.sitelinks && Array.isArray(r.sitelinks) && r.sitelinks.length > 0) {
            h += '<div class="sitelinks">';
            r.sitelinks.forEach(function (sl) {
                const slLink = sl.link || '#';
                const slTitle = sl.title || slLink;
                h += '<a href="' + escHtml(slLink) + '" target="_blank">' +
                    escHtml(slTitle) + '</a>';
            });
            h += '</div>';
        }
        h += '</div>';
        return h;
    }

    function buildPaaItem(item) {
        const question = item.question || 'Unknown question';
        let h = '<div class="paa-item">';
        h += '<div class="paa-question">' + escHtml(question) + '</div>';
        h += '<div class="paa-answer">';
        if (item.snippet) h += escHtml(item.snippet);
        if (item.link) {
            h += '<a href="' + escHtml(item.link) + '" target="_blank">' +
                escHtml(item.title || item.link) + '</a>';
        }
        h += '</div></div>';
        return h;
    }

    // Serper API URL
    function buildUrl(query) {
        return 'https://google.serper.dev/search?q=' +
            encodeURIComponent(query) + '&apiKey=' + API_KEY;
    }

    // Extract a human-readable error from a failed $.ajax call
    function getApiError(jqXHR) {
        if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
            return jqXHR.responseJSON.message;
        }
        if (jqXHR.status === 0) return 'Network error — check your connection.';
        if (jqXHR.status === 400) return 'Bad request (400).';
        if (jqXHR.status === 401) return 'Invalid API key (401).';
        if (jqXHR.status === 403) return 'Forbidden (403).';
        if (jqXHR.status === 429) return 'Rate limit exceeded — you\'ve used your 2,500 free searches.';
        if (jqXHR.status === 500) return 'Serper server error (500) — try again.';
        return 'Unknown error (' + jqXHR.status + ').';
    }

    // XSS protection
    function escHtml(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
