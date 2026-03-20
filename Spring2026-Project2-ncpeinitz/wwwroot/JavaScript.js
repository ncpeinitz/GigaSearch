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
        const current_hour = String(now.getHours()).padStart(2, '0');
        const current_minute = String(now.getMinutes()).padStart(2, '0');
        $('#time').css('visibility', 'visible').html(current_hour + ':' + current_minute);
        $('#time').dialog('open');
    });

    // Trigger Search
    $('#searchButton').click(function () { execute_search(); });

    // Enter key support
    $('#query').keyup(function (keyboard_event) {
        const Enter = 13;
        if (keyboard_event.keyCode === Enter) { execute_search(); }
    });

    // Bonus Button
    $('#luckyButton').click(function () {
        const search_query_text = $('#query').val().trim();
        if (!search_query_text) { alert('Enter a search term first.'); return; }

        $.ajax({
            url: buildUrl(search_query_text),
            method: 'GET',
            dataType: 'json'
        }).done(function (data) {
            if (data.organic && data.organic.length > 0 && data.organic[0].link) {
                window.open(data.organic[0].link, '_blank');
            } else {
                alert('No results found to get lucky with!');
            }
        }).fail(function (jqXHR) {
            alert('Request failed: ' + get_API_Error(jqXHR));
        });
    });

    // Core search function
    function execute_search() {
        const search_query_text = $('#query').val().trim();
        if (!search_query_text) { alert('Please enter a search term.'); return; }

        // Show a loading state immediately
        $('#searchResults')
            .css('visibility', 'visible')
            .html('<p style="color:#cce0ff;text-align:center;padding:20px;">Searching...</p>');

        $.ajax({
            url: buildUrl(search_query_text),
            method: 'GET',
            dataType: 'json'
        }).done(function(data) {
            renderResults(data, search_query_text);
        }).fail(function (jqXHR) {
            const msg = get_API_Error(jqXHR);
            $('#searchResults').html(
                '<p style="color:#ff8080;background:rgba(0,0,0,0.6);' +
                'padding:16px;border-radius:8px;text-align:center;">' +
                '&#9888; Search failed: ' + escape_html(msg) + '</p>'
            );
        });
    }

    // Result Sections
    function renderResults(data, query) {
        let html = '';

        // Knowledge graph
        if (data.knowledgeGraph) {
            html += build_knowledge_graph(data.knowledgeGraph);
        }

        // Organic results
        if (data.organic && data.organic.length > 0) {
            html += '<div class="section-label">Results</div>';
            data.organic.forEach(function (organic_results_list) {
                html += build_organic_results(organic_results_list);
            });
        } else if (!data.knowledgeGraph) {
            html += '<p style="color:#fff;text-align:center;padding:20px;">No results found for ' +
                escape_html(query) + '.</p>';
        }

        // People Also Ask
        if (data.peopleAlsoAsk && data.peopleAlsoAsk.length > 0) {
            html += '<div class="section-label">People Also Ask</div>';
            data.peopleAlsoAsk.forEach(function (item) {
                html += build_people_also_ask_item(item);
            });
        }

        // Related Searches
        if (data.relatedSearches && data.relatedSearches.length > 0) {
            html += '<div class="section-label">Related Searches</div>';
            html += '<div class="related-searches">';
            data.relatedSearches.forEach(function (item) {
                if (item && item.query) {
                    html += '<a class="related-link">' + escape_html(item.query) + '</a>';
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
            execute_search();
        });
    }

    function build_knowledge_graph(knowledge_graph_data) {
        let h = '<div class="knowledge-graph">';
        if (knowledge_graph_data.imageUrl) {
            h += '<img src="' + escape_html(knowledge_graph_data.imageUrl) + '" alt="' + escape_html(knowledge_graph_data.title || '') + '">';
        }
        h += '<div class="kg-text">';
        if (knowledge_graph_data.title) h += '<h2>' + escape_html(knowledge_graph_data.title) + '</h2>';
        if (knowledge_graph_data.type) h += '<div class="kg-type">' + escape_html(knowledge_graph_data.type) + '</div>';
        if (knowledge_graph_data.description) h += '<p>' + escape_html(knowledge_graph_data.description) + '</p>';
        if (knowledge_graph_data.attributes && typeof knowledge_graph_data.attributes === 'object') {
            const entries = Object.entries(knowledge_graph_data.attributes);
            if (entries.length > 0) {
                h += '<div class="kg-attributes">';
                entries.forEach(function ([key, val]) {
                    h += '<span><strong>' + escape_html(key) + ':</strong> ' +
                        escape_html(String(val)) + '</span>';
                });
                h += '</div>';
            }
        }
        h += '</div></div>';
        return h;
    }

    function build_organic_results(r) {
        const link = r.link || '#';
        const title = r.title || 'No Title';
        const snippet = r.snippet || '';

        let h = '<div class="organic-result">';
        h += '<div class="result-url">' + escape_html(link) + '</div>';
        h += '<h3><a href="' + escape_html(link) + '" target="_blank">' +
            escape_html(title) + '</a></h3>';
        if (snippet) {
            h += '<p class="snippet">' + escape_html(snippet) + '</p>';
        }
        if (r.sitelinks && Array.isArray(r.sitelinks) && r.sitelinks.length > 0) {
            h += '<div class="sitelinks">';
            r.sitelinks.forEach(function (sl) {
                const slLink = sl.link || '#';
                const slTitle = sl.title || slLink;
                h += '<a href="' + escape_html(slLink) + '" target="_blank">' +
                    escape_html(slTitle) + '</a>';
            });
            h += '</div>';
        }
        h += '</div>';
        return h;
    }

    function build_people_also_ask_item(item) {
        const question = item.question || 'Unknown question';
        let h = '<div class="paa-item">';
        h += '<div class="paa-question">' + escape_html(question) + '</div>';
        h += '<div class="paa-answer">';
        if (item.snippet) h += escape_html(item.snippet);
        if (item.link) {
            h += '<a href="' + escape_html(item.link) + '" target="_blank">' +
                escape_html(item.title || item.link) + '</a>';
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
    function get_API_Error(jqXHR) {
        if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
            return jqXHR.responseJSON.message;
        }
        if (jqXHR.status === 0) return 'Network error — check your connection.';
        if (jqXHR.status === 400) return 'Bad request (400).';
        if (jqXHR.status === 401) return 'Invalid API key (401).';
        if (jqXHR.status === 403) return 'Forbidden (403).';
        if (jqXHR.status === 429) return 'Rate limit exceeded — you used your 2,500 free searches.';
        if (jqXHR.status === 500) return 'Serper server error (500) — try again.';
        return 'Unknown error (' + jqXHR.status + ').';
    }

    // XSS protection
    function escape_html(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
